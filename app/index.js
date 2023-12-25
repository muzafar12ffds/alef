const sendMessage = require('./libs/sendMessages');
const checkWaybackContent = require('./libs/waybackAPI');
const axios = require('axios');

const botToken = process.env.TELEGRAM_API_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const filterRegExForDomain = new RegExp(process.env.FILTER_REGEX_FOR_DOMAIN, "i");
const filterRegExForWayBack = new RegExp(process.env.FILTER_REGEX_FOR_WAYBACK, "i");


const getData = async () => {
    let {data} = await axios.get('https://backorder.ru/json/?tomorrow=1&links=1&by=links');
    return data;
}

const toString = (array) => {
    let sentString =  '';
    
    for (let i = 0; i < array.length; i++) {
        sentString = sentString + `${array[i].domainname}\n`;
    }    
    return sentString;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms*1000));
  }

const main = async () => {
    const domains = await getData();
    console.log(`Найдено ${domains.length} новых доменов!`);

   if(domains.length > 0){
    
    //Отсекаем домены в реестре РКН, судебные и в стоп листе  
    const availableDomains = domains.filter(({rkn, judicial, block}) => !rkn & !judicial & !block);
    
    //Фильтруем домены по вхождение ключей в название
    const filteredByNameDomains = availableDomains.filter(({domainname}) => filterRegExForDomain.test(domainname) );
    console.log(`Найдено тематичных ${filteredByNameDomains.length} доменов c вхождением ключей в название!`);

    //Фильтруем домены по вхождение ключей в контент в веб-фрхиве. Проверяем только первые 1000 доменов.
    const filteredDomains = [];
    for (const {domainname} of availableDomains.slice(0,1000)) {
        await sleep(1);
        const hasWaybackContent = await checkWaybackContent(domainname, filterRegExForWayBack);
        filteredDomains.push({ domainname, hasWaybackContent });
    }
    const filteredByWabBackDomains = filteredDomains.filter(({ hasWaybackContent }) => hasWaybackContent );
    console.log(`Найдено тематичных ${filteredByWabBackDomains.length} доменов c вхождением ключей в контент в веб-фрхиве!`);
                 
    
        if(filteredByNameDomains.length  > 0 || filteredByWabBackDomains.length  > 0){
            const messageText = `Найдено ${filteredByNameDomains.length + filteredByWabBackDomains.length} новых доменов от ${availableDomains[0].delete_date}!\n\nДомены c вхождением ключей в название:\n${toString(filteredByNameDomains)}\nДомены c вхождением ключей в контент в веб-фрхиве:\n${toString(filteredByWabBackDomains)}`;
            const messageSucsed = sendMessage(chatId, botToken, messageText);

            if(messageSucsed){
                console.log('Отправили сообщение в ТГ');

            }
            
        }
        

    }else{
        console.log(`Нет новых доменов(`);
    }  

    
}

main()
