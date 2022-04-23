class BarChartAppearances {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 50, right: 10, bottom: 75, left: 110},
            tooltipPadding: _config.tooltipPadding || 15
        }
  
    this.data = _data;
    this.initVis();
    
    }

    initVis() {
        let vis = this;
        vis.season = null;
        vis.episode = null;
        
        // This creates an array of length 10 with values equal to their index
        vis.characterNums = Array.from({length: 10}, (x, i) => i);

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // // Append group element that will contain our actual chart (see margin convention)
        const transformheight = - vis.config.margin.top 
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${transformheight})`);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        vis.appList = [];
        vis.nameList = [];

        // Case for all seasons selected
        if (vis.season == null || vis.season == []){
            vis.filterResult = filterData(null, null, vis.episode, vis.data);
        }
        // Single or multiple seasons selected
        else{
            vis.filterResult = filterData(null, vis.season, vis.episode, vis.data);
        }

        // Only keep character data from data query
        vis.characters = vis.filterResult[1];
        
        // Sort all characters by appearance count
        vis.characters.sort(function(a,b){
            return +b.numAppearances - +a.numAppearances;
        });
        vis.characters = vis.characters.slice(0,10);

        // manually inserting into a list to be read later
        for (let i = 0; i < 10; i++){
            vis.appList[i] = vis.characters[i]["numAppearances"];
            vis.nameList[i] = vis.characters[i]["name"];
        }
        
        // scales
        vis.xScale = d3.scaleLinear()
            .domain([0, d3.max(vis.appList)])
            .range([0, vis.width]);
        vis.yScale = d3.scaleBand()
            .paddingInner(0.15)
            .domain(vis.nameList) 
            .range([0, vis.height]);

        // init axis
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0);
        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSizeOuter(0);

        vis.chart.append("text")
            .attr("y", vis.height + 130)
            .attr("x", vis.width/2 - 80)
            .attr("text-anchor", "right")
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text("Appearances");

        // vis.chart.append("text")
        //     .attr("y", -50)
        //     .attr("x", -vis.height / 2 - 50)
        //     .attr("text-anchor", "end")
        //     .attr('font-size', '14px')
        //     .attr("transform", "rotate(-90)")
        //     .attr('font-weight', 'bold')
        //     .text("Characters");

        // init axis groups
        vis.xAxisGroup = vis.chart.append("g")
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.height+75})`);
        

        vis.yAxisGroup = vis.chart.append("g")
            .attr('class', 'axis y-axis')
            // .attr('transform', `translate(0, ${vis.height})`);
            .attr('transform', `translate(0, 75)`);

        vis.renderVis();

    }

    renderVis() {
        let vis = this;

        // Add rectangles
        vis.rect = vis.chart.selectAll('rect')
            .data(vis.characterNums)
            .enter()
            .append('rect')
                .attr('class', 'bar')
                .attr('fill', "#59981A")
                .attr('width', d => vis.xScale(vis.appList[d]))
                .attr('height', vis.yScale.bandwidth())
                .attr('y', d => vis.yScale(vis.nameList[d])+75)
                .attr('x', 1);

        vis.rect.on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${vis.nameList[d]}</div>
                <div><i>Appeared in ${vis.appList[d]} episodes.</i></div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        // Update axis
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }

    updateSeasonEpisode(season, episode){
        let vis = this;
        let equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        vis.chart.selectAll('*').remove();

        vis.season = season;
        vis.episode = episode;

        if (equals(season, ['1', '2', '3', '4', '5', '6']))
            vis.season = null;
        if (episode == -1)
            vis.episode = null;      
        vis.updateVis();
    }
}