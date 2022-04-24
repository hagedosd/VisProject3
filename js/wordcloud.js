class WordCloud {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 10, bottom: 30, left: 110},
            tooltipPadding: _config.tooltipPadding || 15
        }
  
    this.data = _data;
    this.initVis();
    
    }

    initVis(){
        let vis = this;

        // Default show Ted for all seasons
        vis.character = "Ted";
        vis.season = null;

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g');

        // Scale text sizes between 10 and 100
        vis.textSizeScale = d3.scaleLinear()
            .range([10, 80]);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Remove old words
        vis.chart.selectAll("text").remove();

        // Init number of words in cloud to 0
        vis.numWords = 0;

        // Filter data
        vis.filteredData = filterData(vis.character,vis.season,null,vis.data)[1];

        // process data
        // remove stop words
        var stopwords = new Set(
            "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(
              ","
            )
        );

        vis.words = "";
        vis.filteredData.forEach(d => {
            vis.words += d.allLines + " ";
        });
        vis.words = vis.words
            .trim()
            .split(/[\s.]+/g)
            .map((w) => w.replace(/^[“‘"\-—()[\]{}]+/g, ""))
            .map((w) => w.replace(/[;:.!?()[\]{},"'’”\-—]+$/g, ""))
            .map((w) => w.replace(/['’]s$/g, ""))
            .map((w) => w.substring(0, 30))
            .map((w) => w.toLowerCase())
            .filter((w) => w && !stopwords.has(w));

        // Count words
        vis.wordCounts = [];
        vis.uniqueWords = [];
        vis.minWordCount = Infinity;
        vis.maxWordCount = 0;
        vis.words.forEach(d => {
            if (vis.uniqueWords.includes(d)) {
                vis.wordCounts.forEach(j => {
                    if (j.word == d) {
                        j.size += 1;
                    }
                });
            }
            else {
                vis.wordCounts.push({word: d, size: 1});
                vis.uniqueWords.push(d);
            }
        });

        // Limit to top 200 words so it fits in the cloud and loads faster
        if (vis.wordCounts.length > 200) {
            vis.wordCounts.sort((a,b) => b.size - a.size);
            vis.wordCounts = vis.wordCounts.slice(0,200)
        }

        // Set min/max word counts
        vis.wordCounts.forEach(d => {
            if (d.size < vis.minWordCount) {
                vis.minWordCount = d.size;
            }
            if (d.size > vis.maxWordCount) {
                vis.maxWordCount = d.size;
            }
        })

        // Set scale domain
        vis.textSizeScale.domain([vis.minWordCount, vis.maxWordCount])

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // Apply the scale
        vis.wordCounts.forEach(d => {
            d.size = vis.textSizeScale(d.size);
        });

        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        vis.layout = d3.layout.cloud()
            .size([vis.config.containerWidth, vis.config.containerHeight])
            .words(vis.wordCounts.map(function(d) { return {text: d.word, size: d.size}; }))
            .padding(1)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return d.size; })
            .font("Impact")
            .on("end", draw);
        vis.layout.start();

        // This function takes the output of 'layout' above and draw the words
        // Better not to touch it. To change parameters, play with the 'layout' variable above
        function draw(words) {
            vis.chart
            .append("g")
                .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size; })
                .style("fill", "#bf65bf")
                .attr("text-anchor", "middle")
                .attr("font-family", "Impact")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { vis.numWords += 1; return d.text; });
        }

        vis.cloudWords = vis.chart.selectAll("text");

        vis.cloudWords.on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.text}</div>
                <div><i>was spoken ${vis.textSizeScale.invert(d.size)} times.</i></div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        // Update num char appearances
        updateElement('cloudNumWords', vis.numWords);
        if (vis.numWords == 0) {
            document.getElementById('cloudNumWords').style.color = "red";
        }
        else {
            document.getElementById('cloudNumWords').style.color = "black";
        }

    }

    updateCharacterSeason(character, season) {
        let vis = this;
        vis.character = character;
        vis.season = season;
        if (vis.season == "all") {
            vis.season = null;
        }
        vis.updateVis();
    }
}