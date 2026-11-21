//I trust you, translator

import fnol from '/src/pages/folderNameOfLanguages.json';


const browserLang = navigator.language.split("-");
let currentLang='en';
for(let i=browserLang.length+1;i>0;i--){
    let sublang=browserLang.slice(0,i).join('-')
    if(fnol[sublang]){
        currentLang=sublang;
        break;
    }
}
export const path=`/src/pages/${fnol[currentLang]}/`;

//import t from `${path}i18n.json`
//const t = import(`${path}i18n.json`)
//const t = require(`${path}i18n.json`)
//How exactly am I supposed to write this?


//t.path=path;



//export default t; 