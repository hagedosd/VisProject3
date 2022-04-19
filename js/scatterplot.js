var epidsode_counts = [22,22,20,24,24,24,24,24,24];


function compare_id( a, b )
  {
  if ( a.id < b.id){
    return -1;
  }
  if ( a.id> b.id){
    return 1;
  }
  return 0;
}

class ScatterPlot {
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

        vis.chart.append("text")
            .attr("y", vis.height + 130)
            .attr("x", vis.width/2 - 80)
            .attr("text-anchor", "right")
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text("Number of Lines Per Episode");

        vis.chart.append("text")
            .attr("y", -50)
            .attr("x", -vis.height / 2 - 50)
            .attr("text-anchor", "end")
            .attr('font-size', '14px')
            .attr("transform", "rotate(-90)")
            .attr('font-weight', 'bold')
            .text("Episode");


       vis.updateVis();
    }

    updateVis() {
        
        let vis = this;

        var tmp = [[],[],[],[],[],[],[],[],[]];
        var ret = [];
        var characters = ["Ted", "Barney"];
        var i = 0;
        for(i; i < characters.length; i++)
        {
            console.log(i);
            vis.data.forEach(d => {
                
                if (d['character'] == characters[i]){     //// change character here
                    //console.log(d);
                    tmp[d['season'] - 1].push(d);
                }
            });

            // console.log(tmp[0]);

            var tmp_lst = [];
            for(var i=0; i<9; i++){
                tmp[i].forEach(d => {
                    d.id = (parseInt(d['season']) * 100) + parseInt(d['episode']);
                    tmp_lst.push(d);
                });
            }
            tmp_lst.sort(compare_id);

            var count = 0;
            //console.log(characters[i]);
            var id = tmp_lst[0]['id'];
            tmp_lst.forEach(d => {
                //console.log(id);
                if (d.id == id)
                {
                    count = count + 1;
                }
                else
                {
                    ret.push({'season': Math.floor(id/100) ,'episode': id%100,'numLines':count, 'id': id, 'str': "S"+Math.floor(id/100)+"E"+id%100, 'name': characters[i]}); // name
                    count = 1;
                    id = d.id;
                }
            });

            
        }
        vis.scatterplotData = ret;
        



        console.log(vis.scatterplotData);
        
        // scales
        var maxX = vis.scatterplotData.reduce((prev, current)=> ( (prev.id > current.id) ? prev : current),0)
        var maxY = vis.scatterplotData.reduce((prev, current)=> ( (prev.numLines > current.numLines) ? prev : current),0)
        vis.xScale = d3.scaleLinear()
            .domain([0, maxX])
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .domain([0, maxY]) 
            .range([0, vis.height]);

        // init axis
        vis.xAxis = d3.axisBottom(vis.xScale)
            // .tickFormat(d3.format("d")); // Remove thousand comma
            .tickSizeOuter(0);
        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSizeOuter(0);

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
        

        // vis.rect.on('mouseover', (event,d) => {
        //     d3.select('#tooltip')
        //         .style('display', 'block')
        //         .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        //         .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        //         .html(`
        //         <div class="tooltip-title">${vis.characterList[d]}</div>
        //         <div><i>Had ${vis.lineCounts[d]} lines.</i></div>
        //         `);
        // })
        // .on('mouseleave', () => {
        //     d3.select('#tooltip').style('display', 'none');
        // });

        // Update axis
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }

    updateByYear(yearFrom, yearTo){
        let vis = this;
        vis.svg.selectAll('*').remove();
        vis.startYear = yearFrom;
        vis.endYear = yearTo;
        vis.updateVis();
    }
}