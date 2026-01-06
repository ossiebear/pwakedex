// detail-render-chart.js
// Description: Renders Pokémon stats as a D3.js bar chart
// Author: Oscar Collins
// AI usage: First version manually written, lots of help from AI for D3.js syntax and structure

// Full description:
// This script uses D3.js to create a bar chart displaying a Pokémon's base stats (HP, Attack, Defense, etc.).
// It defines functions to create the SVG container, scales, and populate the chart with bars, labels, and axes.
// The main exported function `displayStats(stats)` takes an array of stat objects and renders the chart within a specified container element.









// CONSTANTS ___________________________________________________________
const EL_POKE_STATS_CHART_CONTAINER = document.getElementById('pokemon-stats-chart-container');

// Chart settings
const MARGIN = {top: 20, right: 20, bottom: 50, left: 80};
const WIDTH = 500 - MARGIN.left - MARGIN.right;
const HEIGHT = 350 - MARGIN.top - MARGIN.bottom;
const MAX_STAT = 255;
const STAT_BAR_COLORS = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];
//________________________________________________________________________________________











// CHART INITIALIZATION___________________________________________________________
/**
 * Creates D3.js chart structure with SVG container and scales
 * 
 * @param {Array} stats - Array of stat objects with {name: string, value: number}
 * @returns {Object} Chart elements: {svg, xScale, yScale, colorScale}
 */
function createChart(stats) {
    console.debug("createChart()");

    EL_POKE_STATS_CHART_CONTAINER.innerHTML = '';
    
    // Create responsive SVG container for the chart----------------------------
    const svg = d3.select('#pokemon-stats-chart-container')
        .append('svg')
        .attr('width', WIDTH + MARGIN.left + MARGIN.right)
        .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
        .attr('viewBox', `0 0 ${WIDTH + MARGIN.left + MARGIN.right} ${HEIGHT + MARGIN.top + MARGIN.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('max-width', '100%')
        .style('height', 'auto')
        .append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);
    //-------------------------------------------------------------------------



    // Create scales----------------------------------------------------------
    const statNames = stats.map(function(d) { return d.name; }); // supposably adds all stat names to array ["HP", "ATTACK", etc.]
    
    // Create X scale
    const xScale = d3.scaleBand()
        .domain(statNames)
        .range([0, WIDTH])
        .padding(0.2);
    
    // Create Y scale (0 to 255)
    const yScale = d3.scaleLinear()
        .domain([0, MAX_STAT])
        .range([HEIGHT, 0]);
    
    // Set bar colors using ordinal scale
    const colorScale = d3.scaleOrdinal()
        .domain(stats.map(function(d) { return d.name; }))
        .range(STAT_BAR_COLORS);
    //-------------------------------------------------------------------------



    return {svg, xScale, yScale, colorScale};
}
//________________________________________________________________________________________












// CHART POPULATION___________________________________________________________
/**
 * Populates the chart with data bars, value labels, and axes
 * 
 * @param {Object} chartElements - Object containing {svg, xScale, yScale, colorScale}
 * @param {Array} stats - Array of stat objects with {name: string, value: number}
 */
function populateChart(chartElements, stats) {
    console.debug("populateChart()");
    
    const {svg, xScale, yScale, colorScale} = chartElements;
    
    // Add colored stat bars (one per stat)
    svg.selectAll('.bar')
        .data(stats)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return xScale(d.name); })
        .attr('width', xScale.bandwidth())
        .attr('y', function(d) { return yScale(d.value); })
        .attr('height', function(d) { return HEIGHT - yScale(d.value); })
        .attr('fill', function(d) { return colorScale(d.name); })
        .attr('rx', 4); // Rounded corners
    
    // Add value labels on top of bars (displays stat value)
    svg.selectAll('.label')
        .data(stats)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2; }) // Center horizontally
        .attr('y', function(d) { return yScale(d.value) - 5; }) // 5px above bar
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(function(d) { return d.value; });
    
    // Add X axis (stat names)
    svg.append('g')
        .attr('transform', `translate(0,${HEIGHT})`) // Position at bottom
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', '#fff')
        .attr('transform', 'rotate(-45)') // Diagonal labels for readability
        .style('text-anchor', 'end')
        .style('font-size', '10px');
    
    // Add Y axis (stat values 0-255)
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5)) // 5 tick marks
        .selectAll('text')
        .attr('fill', '#fff');
    
    // Style axis lines (subtle white lines)
    svg.selectAll('.domain, .tick line')
        .attr('stroke', '#fff')
        .attr('stroke-opacity', 0.3);
}
//________________________________________________________________________________________











// MAIN EXPORT___________________________________________________________
/**
 * Main entry point: Displays Pokémon stats as interactive D3.js bar chart
 * 
 * @param {Array} stats - Raw PokeAPI stats array from pokemon.stats field
 *                        Expected format: [{stat: {name: string}, base_stat: number}]
 * @returns {Promise<void>}
*/
export async function displayStats(stats) {
    console.debug("displayStats()");
    
    // Guard clause: handle missing/empty stats data
    if (!stats || stats.length === 0) {
        EL_POKE_STATS_CHART_CONTAINER.innerHTML = '<p class="text-muted mb-0">No stats data available</p>';
        return;
    }
    
    // Transform PokeAPI format to chart-friendly format
    // Converts: {stat: {name: 'special-attack'}, base_stat: 65}
    // To: {name: 'SPECIAL ATTACK', value: 65}
    const CHART_FORMATTED_STATS = stats.map(function(statObj) {
        return {
            name: statObj.stat.name.replace('-', ' ').toUpperCase(),
            value: statObj.base_stat
        };
    });
    
    
    // Create SVG and scales
    const chartElements = createChart(CHART_FORMATTED_STATS);
    
    // Render bars, labels, and axes
    populateChart(chartElements, CHART_FORMATTED_STATS);
}
//________________________________________________________________________________________