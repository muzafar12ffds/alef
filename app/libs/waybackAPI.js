const axios = require('axios').default;

const getAvailable = async (domain) => {
    try{
        const response = await axios.get(`http://archive.org/wayback/available?url=${domain}&timestamp=20060101`, {
            headers: {
            'Content-Type': 'application/json',
            
            }
        })
        if(Object.entries(response.data.archived_snapshots).length){
            console.log('Успешно '+domain);
            return response.data.archived_snapshots.closest.url;
        }else{
            console.log('Нет в веб-архиве '+domain);
            return false;
        }
        
    }catch(error){
        console.log(error);
        return false;
    }
   
}

const getHTML = async (url) => {
    try{
        const response = await axios.get(url);
        console.log('Успешно');
        return response.data;
    }catch(error){
        console.log(error);
        return [];
    }
   
}

module.exports  = async (domain, filterRegEx) => {
    const url = await getAvailable(domain);
    if(url){
        const html = await getHTML(url);
        if(html){
            return filterRegEx.test(html);
        }else{
            console.log('Нет html');
            return false;
        }
        
    }else{
        console.log('Нет url');
        return false;
    }
    
    
}