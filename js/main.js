let characters = []






//default processing for character data than can be re-done on a specific season/episode selection
d3.csv('data/himym-dialogues.csv')
.then(data => {
    data.forEach(d => {
        //add an if with season/episode filtering here
        if (characters.some(item => item.name === d.character)){
            characters.some(function(item){
                if (item.name === d.character){
                    item.numLines += 1;
                    return true;
                }
            });
        }
        else{
            characters.push({"name" : d.character, "numLines" : 1});
        }
    });
    console.log(data)
    console.log(characters);
}).catch(error => console.error(error));



