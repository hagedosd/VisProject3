//see examples at the bottom
d3.csv('data/himym-dialogues.csv')
.then(data => {

    // Create an instance of each chart
    barChartAppearances = new BarChartAppearances({parentElement: '#barchartAppearances'}, data);
    barChartLines = new BarChartLines({parentElement: '#barchartLines'}, data);
    scatterplot = new ScatterPlot({parentElement: '#scatterplot'}, data);
    treeMapAppearances = new TreeMapAppearances({parentElement: '#treemapAppearances'}, data);
    treeMapLines = new TreeMapLines({parentElement: '#treemapLines'}, data);

    //gets all data for various init settings on page
    var initData = filterData(null,null,null,data);
    initSelects(initData);

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

//returns filtered data based on parameters, not well optimized but who cares?
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

function updateChartsBySeasonEpisode(season,episode){
    //notes: -1 for season means all seasons/episodes (null episode)
    // -1 for episode means all episodes for season
    console.log(season);
    console.log(episode);
    //chart.functionToUpdateBySeasonEpisode(season,episode)
}
function updateChartsByCharacter(character){
    console.log(character);
    //chart.functionToUpdateByCharacter(character)
}

//formats select data and then populates selects
function initSelects(initData) {
    const seasonSelectData=[{"display": "Seasons 1-6", "value" : -1},{"display": "Season 1", "value" : 1},{"display": "Season 2", "value" : 2},{"display": "Season 3", "value" : 3},{"display": "Season 4", "value" : 4},{"display": "Season 5", "value" : 5},{"display": "Season 6", "value" : 6}] //2ez
    const selectSeason = document.getElementById('selectSeason')
    seasonSelectData.forEach(d => selectSeason.add(new Option(d.display,d.value)));
    const characterSelectData=[]
    const selectCharacter = document.getElementById('selectCharacter');
    let characters = initData[1];
    characters.some(function(c){
        characterSelectData.push({"display": c.name + " (" + c.numLines + " lines )", "value": c.name, "numLines": c.numLines});
    });
    characterSelectData.sort(function(a,b){
        return +b.numLines - +a.numLines;
    });
    characterSelectData.forEach(d => selectCharacter.add(new Option(d.display,d.value)));
}

//handle season and episode selections
$(document).ready(function(){
    $('#selectSeason').on('change', function() {
        if($('#selectSeason').val() != -1){
            d3.csv('data/himym-dialogues.csv')
                .then(data => {
                    var data = filterData(null,null,null,data);
                    const episodeSelectData = []
                    let episodes = data[0]
                    episodes.some(function (e){
                        if(e.season == $('#selectSeason').val()){ //need to use double equal NOT triple equal (⌐■_■)
                            if(!episodeSelectData.some( s => s.value == e.episode)){
                                episodeSelectData.push({"display": "Episode " +  e.episode, "value": +e.episode});
                            }
                        } 
                    });
                    episodeSelectData.sort(function(a,b){
                        return +a.value - +b.value;
                    });
                    episodeSelectData.unshift({"display": "Episodes " +  episodeSelectData[0].value + " - " + episodeSelectData[episodeSelectData.length - 1].value , "value": -1})
                    const selectEpisode = document.getElementById('selectEpisode');
                    selectEpisode.options.length = 0;
                    episodeSelectData.forEach(d => selectEpisode.add(new Option(d.display,d.value)));
                    $('#selectEpisodeDiv').show()
                    updateChartsBySeasonEpisode($('#selectSeason').val(),$('#selectEpisode').val())
                }).catch(error => console.error(error));
        }
        else{
            const selectEpisode = document.getElementById('selectEpisode');
            selectEpisode.options.length = 0;
            $('#selectEpisodeDiv').hide()
            updateChartsBySeasonEpisode($('#selectSeason').val(),$('#selectEpisode').val())
        }
    });
    $('#selectEpisode').on('change', function() {
        updateChartsBySeasonEpisode($('#selectSeason').val(),$('#selectEpisode').val())
    });
    $('#selectCharacter').on('change', function() {
        updateChartsByCharacter($('#selectCharacter').val())
    }); 
});

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