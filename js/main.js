let characters = []
let episodes = []

d3.csv('data/himym-dialogues.csv')
.then(data => {
    //default processing for season/episode data than can be re-run on a specific character selection
    data.forEach(d => {
        //add a conditional for character filtering here
        if (episodes.some(item => item.season === d.season && item.episode == d.episode)){
            episodes.some(function(item){
                if (item.season === d.season && item.episode == d.episode){
                    item.numScenes = d.scene;
                    if(!item.characters.includes(d.character)){
                        item.characters.push(d.character);
                    }
                    return true;
                }
            });
        }
        else{
            episodes.push({"season" : d.season, "episode" : d.episode, "numScenes" : d.scene, "characters" : [d.character]});
        }
    });
    //default processing for character data than can be re-run on a specific season/episode selection
    data.forEach(d => {
        //add an conditioanl for season/episode filtering here
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
    console.log(episodes)
    //TODO: filtering examples below

}).catch(error => console.error(error));



