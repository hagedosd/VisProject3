//see examples at the bottom
d3.csv('data/himym-dialogues.csv')
.then(data => {

    // Create an instance of each chart
    barChartAppearances = new BarChartAppearances({parentElement: '#barchartAppearances'}, data);
    barChartLines = new BarChartLines({parentElement: '#barchartLines'}, data);
    treeMapAppearances = new TreeMapAppearances({parentElement: '#treemapAppearances'}, data);
    treeMapLines = new TreeMapLines({parentElement: '#treemapLines'}, data);
}).catch(error => console.error(error));

//on option change update tree map
function updateTreeAppearances(value) {
    treeMapAppearances.updateTree(value);
}
function updateTreeLines(value) {
    treeMapLines.updateTree(value);
}

// update html element
function updateElement(id, value) {
    console.log('Updating element! current value of ', id, document.getElementById(id).innerHTML)
    document.getElementById(id).innerHTML = value;
}

function filterData(character, season, episode, data) {
    let characters = []
    let episodes = []
    data.forEach(d => {
        if ((d.character === character || character === null) && (d.season === season || season === null) && (d.episode === episode || episode === null)){
            if (episodes.some(e => e.season === d.season && e.episode == d.episode)){
                episodes.some(function(e){
                    if (e.season === d.season && e.episode == d.episode){
                        e.numScenes = d.scene;
                        if(e.characters.some(character => character.name === d.character)){
                            e.characters.some(function(c){
                                if (c.name === d.character){
                                    c.numLines += 1;
                                    return true;
                                }
                            });
                        }
                        else{
                            e.characters.push({"name" : d.character, "numLines" : 1});
                        }
                        return true;
                    }
                });
            }
            else{
                episodes.push({"season" : d.season, "episode" : d.episode, "numScenes" : d.scene, "characters" : [{"name" : d.character, "numLines" : 1}]});
            }
        }
    });
    episodes.forEach(e => {
        e.characters.forEach(d => {
            if (characters.some(c => c.name === d.name)){
                characters.some(function(c){
                    if (c.name === d.name){
                        c.numLines += d.numLines;
                        return true;
                    }
                });
            }
            else{
                characters.push({"name" : d.name, "numLines" : d.numLines});
            }
        })
    });
    return [episodes , characters];
}

// let result = filterData(null, null, null, data);
//     let episodes = result[0];
//     let characters = result[1];
//     console.log("data below is relevent to whole series")
//     console.log(episodes);
//     console.log(characters);

    
    //Examples of filtering on selection

    //selecting a character -> which episodes/seasons they appear in, how much they speak in these episodes/seasons

    // result = filterData("Ted", null, null, data);
    // // result = filterData(null, null, null, data);
    // episodes = result[0];
    // characters = result[1];
    // console.log("data below is only going to relevent to Ted")
    // console.log(episodes);
    // console.log(characters);

    // //selecting a episode or a season -> which characters eppeared, who spoke most often etc
    
    // result = filterData(null, "1", null, data);
    // episodes = result[0];
    // characters = result[1];
    // console.log("data below is only going to relevent to Season 1")
    // console.log(episodes);
    // console.log(characters);

    // result = filterData(null, null, "8", data);
    // episodes = result[0];
    // characters = result[1];
    // console.log("data below is only going to relevent to 8th episodes of seasons")
    // console.log(episodes);
    // console.log(characters);

    // //all filters applied

    // result = filterData("Lily", "3", "4", data);
    // episodes = result[0];
    // characters = result[1];
    // console.log("data below is only going to relevent to Lily in Season 3 episode 4")
    // console.log(episodes);
    // console.log(characters);