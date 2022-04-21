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

        // Filter data
        vis.filteredData = filterData("Ted","1","1",vis.data)[1];

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.bottom}, ${vis.config.margin.top})`)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

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
        // console.log("all words: ", vis.words)
        vis.words = vis.words
            .trim()
            .split(/[\s.]+/g)
            .map((w) => w.replace(/^[“‘"\-—()[\]{}]+/g, ""))
            .map((w) => w.replace(/[;:.!?()[\]{},"'’”\-—]+$/g, ""))
            .map((w) => w.replace(/['’]s$/g, ""))
            .map((w) => w.substring(0, 30))
            .map((w) => w.toLowerCase())
            .filter((w) => w && !stopwords.has(w));

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
        vis.layout = d3.layout.cloud()
            .size([vis.config.containerWidth, vis.config.containerHeight])
            .words(vis.words.map(function(d) { return {text: d}; }))
            .padding(10)
            .fontSize(60)
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
                .style("font-size", function(d) { return d.size + "px"; })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
        }

        // var fontFamily = "sans-serif";
        // var fontScale = 15;
        // var padding = 0;
        // var height = 500;
        // var width = 700;
        // const rotate = () => 0;

        // vis.w_cloud = cloud()
        // .size([width, height])
        // .words(vis.cloudData.map((d) => Object.create(d)))
        // .padding(padding)
        // .rotate(rotate)
        // .font(fontFamily)
        // .fontSize((d) => Math.sqrt(d.value) * fontScale)
        // .on("word", ({ size, x, y, rotate, text }) => {
        //   svg
        //     .append("text")
        //     .attr("font-size", size)
        //     .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
        //     .text(text);
        // });
    
        // w_cloud.start();

    }
}