
d3.json("data/vcdb-SIMPLIFICADA.json", function(datos){
    
    d3 = d3version3;
    
    
    
    // VARIABLES GLOBALES
    
    // Variable que almacena el numero total de incidentes ocurridos, por defecto sera el total, pero al hacer click sobre los paises se ira modificando  (de momento no porque se hara con el total y porcentajes)
    // var totalSize = countOfIncidentsPerCountry.reduce((a, b) => a + b, 0);
    
    // Variable donde se almacenara el nombre el pais del mapa sobre el que se haga click. Por defecto toma valor "All", por si se filtra solo por año y no por pais
    var countryName = "All";
    
    // Variable donde se almacenara el nombre del pais seleccionado en la iteracion anterior, para en ese caso evitar actualizar todas las graficas de nu
    var previousCountryName;
    
    // Variable que almacenara el año seleccionado en el desplegable de la barra de navegacion. Por defecto toma valor "All", por si se filtra solo por pais y no por año
    var yearValue = "All";
    
    
    
    // MAPA
    // http://datamaps.github.io/ y http://jsbin.com/kuvojohapi/1/edit?html,output
    
    // Calcular dimensiones SVG
    var row = d3.select("#mapRow");
    var rowDimensions = row.node().getBoundingClientRect();
    var rowHeight = rowDimensions.height * 0.85;
    var mapWidth = rowDimensions.width * 0.55;
    
    // Prepara los datos de la forma que espera datamap
    var datasetMap = prepareDatamap(datos);
    
  //  drawDatamap(datasetMap);
    
    // GRAFICO DE BARRAS       
    // https://bl.ocks.org/hrecht/f84012ee860cb4da66331f18d588eee3
    
    var barChartMargin = {
        top:20,
        bottom:15,
        left:120,
        right:25
    }
        
    var barChartWidth = mapWidth * 0.4;
    var barChartHeight = rowHeight;

    // SVG que englobe al grafico de barras
    var svgBars = d3.select("#barContainer")
        .append("svg")
        .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
        .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top +")");
    
    var industries = datos.map(function(d) { return d.victim.industry_name; });
    var datasetBars = prepareData(industries, "industries");
    
    
    
    // SUNBURST 1
    // https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5, https://bl.ocks.org/kerryrodden/7090426, https://bl.ocks.org/mbostock/4063423
    
    var sunburstHeight = rowHeight * 0.75;
    var sunburstWidth = mapWidth * 0.5;
     
    // Create primary <g> element
    var svgSunburstActions = d3.select("#sunburst1Container")
        .append("svg")
        .attr("width", sunburstWidth)
        .attr("height", sunburstHeight)
        .append("g")
        .attr("transform", "translate(" + sunburstWidth * 0.5 + "," + sunburstHeight * 0.5 + ")");
    
    // Situar el div en el centro del Sunburst
    var divDimensionsActions = document.querySelector("#sunburst1Container").getBoundingClientRect();
    var explanationActionsContainer = document.querySelector("#explanation1");
    var explanationActionsDimensions = explanationActionsContainer.getBoundingClientRect()
    explanationActionsContainer.style.left = divDimensionsActions.width * 0.5 - explanationActionsDimensions.width * 0.5 + "px";
    explanationActionsContainer.style.top = divDimensionsActions.height * 0.5 + "px";
    
    // Prepara SVG donde se mostrara la secuencia seleccionada en el Sunburst
    var trailActions = d3.select("#sequence1")
        .append("svg")
        .attr("width", sunburstWidth * 1.25)
        .attr("height", sunburstHeight / 10)
        .attr("transform", "translate(" + sunburstWidth * 0.025 + "," + sunburstHeight / 35 + ")");
    
    // Add the label at the end, for the percentage.
    trailActions.append("svg:text")
        .attr("id", "endlabel")
        .attr("class", "endlabelSunburst")
    
    // Define como variables para poder pasarselas a las funciones que actualizan sus valores
    var explanationActions = d3.select("#explanation1");
    var percentageActions = d3.select("#percentage1");
    var numberActions = d3.select("#number1");
    
    var actions = datos.map(function(d) {  return d.action; });
    var datasetSunburstActions = prepareSunburst(actions);
    
    // Array donde cada posicion es el nombre de las acciones    
    var nodeNamesActions = datasetSunburstActions.children.map(function(d) { return(d.name) })
       
    //Azules a probar: #032D58, #0DB6DC, #095994
    var colorScaleActions = d3.scale.linear()
        .domain([0,nodeNamesActions.length-1])  
        .range(["#032D58","#00F5FF"]); 

    
    
    // SUNBURST 2
    // https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5, https://bl.ocks.org/kerryrodden/7090426, https://bl.ocks.org/mbostock/4063423
     
    // Create primary <g> element
    var svgSunburstActors = d3.select("#sunburst2Container")
        .append("svg")
        .attr("width", sunburstWidth)
        .attr("height", sunburstHeight)
        .append("g")
        .attr("transform", "translate(" + sunburstWidth * 0.5 + "," + sunburstHeight * 0.5 + ")");
    
    // Situar el div en el centro del Sunburst
    var divDimensionsActors = document.querySelector("#sunburst2Container").getBoundingClientRect();
    var explanationActorsContainer = document.querySelector("#explanation2");
    var explanationActorsDimensions = explanationActorsContainer.getBoundingClientRect()
    explanationActorsContainer.style.left = divDimensionsActors.width * 0.5 - explanationActorsDimensions.width * 0.5 + "px";
    explanationActorsContainer.style.top = divDimensionsActors.height * 0.5 + "px";
    
    // Prepara SVG donde se mostrara la secuencia seleccionada en el Sunburst
    var trailActors = d3.select("#sequence2")
        .append("svg")
        .attr("width", sunburstWidth * 1.25)
        .attr("height", sunburstHeight / 10)
        .attr("transform", "translate(" + sunburstWidth * 0.025 + "," + sunburstHeight / 35 + ")");
    
     // Add the label at the end, for the percentage.
    trailActors.append("svg:text")
        .attr("id", "endlabel")
        .attr("class", "endlabelSunburst")
    
    // Define como variables para poder pasarselas a las funciones que actualizan sus valores
    var explanationActors = d3.select("#explanation2");
    var percentageActors = d3.select("#percentage2");
    var numberActors = d3.select("#number2");
    
    var actors = datos.map(function(d) {  return d.actor; });
    var datasetSunburstActors = prepareSunburst(actors);
    
    // Array donde cada posicion es el nombre de las acciones    
    var nodeNamesActors = datasetSunburstActors.children.map(function(d) { return(d.name) })
   
    //Azules a probar: (#032D58, #0DB6DC) o #095994
    var colorScaleActors = d3.scale.linear()
        .domain([0,nodeNamesActors.length-1])  
        .range(["#032D58","#00F5FF"]); 
    
    
    
    // GRAFICO DE LINEA TEMPORAL
    // https://bl.ocks.org/mbostock/3883245 y https://bl.ocks.org/d3noob/119a138ef9bd1d8f0a8d57ea72355252
    
    // set the dimensions and margins of the graph
    var timelineMargin = {
        top: 10,
        right: 20,
        bottom: 25,
        left: 50
    }
    
    // Calcula las dimensiones del SVG en base a las dimensiones de los Sunburst
    var timelineWidth = sunburstWidth;
    var timelineHeight = sunburstHeight * 0.85 ;    
   
    // append the svg obgect to the body of the page, append a 'group' element to 'svg' and move the 'group' element to the top margin
    var svgTimeline = d3.select("#timelineContainer")
        .append("svg")
        .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
        .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom)
        .append("g");
    
    // Prepara SVG donde se mostrara el intervalo temporal que se muestra en la grafica
    var trailTimeline = d3.select("#sequence3")
        .append("svg")
        .attr("width", sunburstWidth * 1.25)
        .attr("height", sunburstHeight / 50);
    
    var years = datos.map(function(d) { return d.timeline.incident.year; });
    var datasetTimeline = prepareData(years, "years");
    
    // Llama a la funcion que actualiza todas las graficas, en este caso (primera vez que carga la pagina), para todos los paises y años del dataset
     updateData(countryName, yearValue);
    
    
    
    // UPDATE BASADO EN LOS VALORES QUE SE ELIJAN EN LA BARRA DE NAVEGACION
    
    // Pais seleccionado
    d3.select("#selectedCountry").on("change", updateByCountry);
    
    // Año seleccionado
    d3.select("#selectedYear").on("change", updateByYear); 
    
    // Alcance worldwide
    d3.select("#worldwide").on("click", function (){
        // La variable global que indica el pais seleccionado vuelve a ser "All"
        countryName = "All";
        // Modifica el estado del desplegable en la barra de navegacion
        document.getElementById("selectedCountry").value = "All";
        // Actualiza el mapa con el dataset inicial
        updateData("All", yearValue);
    });
    
    function drawDatamap(data) {
    
        // Elimina todo el contenido del contenedor para pintar un nuevo mapa
        d3.select("#mapContainer").selectAll("svg")
              .remove();

        // Genera el mapa a partir del dataset
        var datamapChart = new Datamap({
            element: document.querySelector('#mapContainer'),
            // Se podria hacer tambien con equirectangular
            projection: 'mercator', 
            // Color para los paises que no aparezcan en el dataset (se define como color por defecto)
            fills: { defaultFill: '#F5F5F5' },
            height: rowHeight,
            width: mapWidth,
            data: data,
            // Acciones al pasar el raton por encima de los paises
            geographyConfig: {
                // Definir el color por defecto del borde de los paises
                borderColor: '#DEDEDE',
                // No cambiar el color de fondo de los paises al pasar el raton
                highlightFillColor: function(geo) {
                    return geo['fillColor'] || '#F5F5F5';
                },
                // En caso de pasar el raton sobre un pais, solo se agranda borde y se colorear mas oscuro
                highlightBorderWidth: 2,
                highlightBorderColor: '##DEDEDE',
                // Informacion a mostrar en tooltip
                popupTemplate: function(geo, data) {
                    // No se muestra tooltip si el pais no se encuentra en el dataset
                    if (!data) { return ; }
                    // Contenido del tooltip
                    return ['<div class="hoverinfo">',
                        '<strong>', geo.properties.name, '</strong>',
                        '<br>Incidents: <strong>', data.numberOfIncidents, '</strong>',
                        '</div>'].join('');
                }
            },
            // Todos los eventos estan linkados al elemento SVG raiz, para escucharlos se utiliza done (callback): https://github.com/markmarkoh/datamaps/blob/master/README.md#getting-started
            done: function(datamap) {
                // En caso de hacer click sobre un pais, se almacena su nombre en la variale countryName, que se pasara al resto de graficas
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {

                    // Variable que toma el nombre del pais sobre el que se haya hecho click
                    countryName = geography.id;

                    // Unicamente se actualizan las graficas si se ha hecho click en un pais diferente al anterior sobre el que se hizo click (evita actualizar si se hace click muchas veces seguidas sobre el mismo pais)
                    if (countryName != previousCountryName){

                        // Guarda el pais seleccionado actualmente como el previo, de cara a comprobar en la siguiente iteracion del usuario si se ha vuelto a seleccionar el mismo pais
                        previousCountryName = countryName;

                        // Modifica el estado del desplegable en la barra de navegacion
                        document.getElementById("selectedCountry").value = countryName;

                        // Actualiza las graficas con el pais sobre el que se haya hecho click y con el año que este seleccionado en el desplegable de la barra de navegacion
                        updateData(countryName, yearValue);

                    }
                });
            }
        }); 
    }
    
    function updateByCountry() {
        
        // Almacena el pais seleccionado en el dropdpwn
        countryName = this.options[this.selectedIndex].value;
        // Para que datamap pueda comprobar si se ha hecho click en un pais ya seleccionado en el dropdown y asi no se actualicen otra vez las graficas si ya esta seleccionado
        previousCountryName = countryName;
        // Actualiza las graficas con el pais seleccionado en el dropdown y con el año que ya este seleccionado en el otro dropdown
        updateData(countryName, yearValue);   
        
    }
    
    function updateByYear() {
        
        // Almacena el año seleccionado en el dropdpwn
        yearValue = this.options[this.selectedIndex].value;
        // Actualiza las graficas con el año seleccionado en el dropdown y con el pais que ya este seleccionado en el otro dropdown
        updateData(countryName, yearValue);   
    }
    
    function updateData(country, year) {
          
        // Actualiza las graficas con datos totales
        if (country == "All" && year == "All"){
            
            var updatedDataset = prepareDatamap(datos);
            drawDatamap(updatedDataset);
            
            var updatedIndustries = datos.map(function(d) { return d.victim.industry_name; });
            var updatedDatasetBars = prepareData(updatedIndustries, "industries");
            drawBars(svgBars, barChartWidth, barChartHeight, barChartMargin, updatedDatasetBars);
            
            var updatedActions = datos.map(function(d) {  return d.action; });
            var updatedDatasetSunburstActions = prepareSunburst(updatedActions);
            drawSunburst(updatedDatasetSunburstActions, svgSunburstActions, sunburstWidth, sunburstHeight, trailActions, explanationActions, percentageActions, numberActions, nodeNamesActions, colorScaleActions);
            
            var updatedActors = datos.map(function(d) {  return d.actor; });
            var updatedDatasetSunburstActors = prepareSunburst(updatedActors);
            drawSunburst(updatedDatasetSunburstActors, svgSunburstActors, sunburstWidth, sunburstHeight, trailActors, explanationActors, percentageActors, numberActors, nodeNamesActors, colorScaleActors);
            
            var updatedYears = datos.map(function(d) { return d.timeline.incident.year; });
            var updatedDatasetTimeline = prepareData(updatedYears, "years");
            drawTimeline(svgTimeline, timelineWidth, timelineHeight, timelineMargin, updatedDatasetTimeline);
            
            var checkIfData = updatedDataset;
            
            // Si para todos los paises y todos los años, aparece mensaje de que no hay datos y se actualizan todas las graficas vacias (en principio este caso nunca ocurre porque el dataset original no esta vacio)
            if (checkIfData.length == 0) {
                d3.select("#alertMessage").style("visibility", "");
            }
            else {
                d3.select("#alertMessage").style("visibility", "hidden");
            }     
            
            // Como year es "All", se puede mostrar la prediccion calculada por lo que se muestra el boton
            d3.select("#sequence3").style("visibility", "");
            d3.select("#prediction").on("click", clickPrediction);
            
        }
        
        // Actualiza las graficas con datos totales de pais y filtrados por año
        else if (country == "All" && year != "All"){
            
            var updatedDataset = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d);
                }  
            });
            var updatedDatamap = prepareDatamap(updatedDataset);
            drawDatamap(updatedDatamap);
            
            var updatedIndustries = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d.victim.industry_name);
                }  
            }).map(function(d) { return d.victim.industry_name; });
            var updatedDatasetBars = prepareData(updatedIndustries, "industries")
            drawBars(svgBars, barChartWidth, barChartHeight, barChartMargin, updatedDatasetBars);

            var updatedActions = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d.action);
                }  
            }).map(function(d) { return d.action; });
            var updatedDatasetActions = prepareSunburst(updatedActions)
            drawSunburst(updatedDatasetActions, svgSunburstActions, sunburstWidth, sunburstHeight, trailActions, explanationActions, percentageActions, numberActions, nodeNamesActions, colorScaleActions);    

            var updatedActors = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d.actor);
                }  
            }).map(function(d) { return d.actor; });
            var updatedDatasetActors = prepareSunburst(updatedActors)
            drawSunburst(updatedDatasetActors, svgSunburstActors, sunburstWidth, sunburstHeight, trailActors, explanationActors, percentageActors, numberActors, nodeNamesActors, colorScaleActors);

            var updatedYears = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d.timeline.incident.year);
                }  
            }).map(function(d) { return d.timeline.incident.year; });
            var updatedDatasetTimeline = prepareData(updatedYears, "years")
            drawTimeline(svgTimeline, timelineWidth, timelineHeight, timelineMargin, updatedDatasetTimeline);
            
            var checkIfData = updatedDataset;
            
            // Si para el año seleccionado no hay datos de ningun pais, aparece mensaje de que no hay datos y se actualizan todas las graficas vacias (en principio este caso nunca ocurre porque hay datos de todos los años)
            if (checkIfData.length == 0) {
                d3.select("#alertMessage").style("visibility", "");
            }
            else {
                d3.select("#alertMessage").style("visibility", "hidden");
            }
            
            // No se muestra el boton de prediccion, por estar un año seleccionado
            d3.select("#sequence3").style("visibility", "hidden");
        }
        
        //Actualiza las graficas con datos de un pais
        else if (country != "All" && year == "All"){
           
            var updatedDataset = prepareDatamap(datos);
            drawDatamap(updatedDataset);
            
            var updatedIndustries = datos.filter(function(d) { 
                if (d.victim.country==country){
                    return(d.victim.industry_name);
                }  
            }).map(function(d) { return d.victim.industry_name; });
            var updatedDatasetBars = prepareData(updatedIndustries, "industries")
            drawBars(svgBars, barChartWidth, barChartHeight, barChartMargin, updatedDatasetBars);

            var updatedActions = datos.filter(function(d) { 
                if (d.victim.country==country){
                    return(d.action);
                }  
            }).map(function(d) { return d.action; });
            var updatedDatasetActions = prepareSunburst(updatedActions)
            drawSunburst(updatedDatasetActions, svgSunburstActions, sunburstWidth, sunburstHeight, trailActions, explanationActions, percentageActions, numberActions, nodeNamesActions, colorScaleActions);    

            var updatedActors = datos.filter(function(d) { 
                if (d.victim.country==country){
                    return(d.actor);
                }  
            }).map(function(d) { return d.actor; });
            var updatedDatasetActors = prepareSunburst(updatedActors)
            drawSunburst(updatedDatasetActors, svgSunburstActors, sunburstWidth, sunburstHeight, trailActors, explanationActors, percentageActors, numberActors, nodeNamesActors, colorScaleActors);

            var updatedYears = datos.filter(function(d) { 
                if (d.victim.country==country){
                    return(d.timeline.incident.year);
                }  
            }).map(function(d) { return d.timeline.incident.year; });
            var updatedDatasetTimeline = prepareData(updatedYears, "years")
            drawTimeline(svgTimeline, timelineWidth, timelineHeight, timelineMargin, updatedDatasetTimeline);
            
            var checkIfData = datos.filter(function(d) { 
                if (d.victim.country==country){
                    return(d);
                }  
            });
            
            // Si para el pais seleccionado no hay datos de ningun año, aparece mensaje de que no hay datos y se actualizan todas las graficas vacias 
            if (checkIfData.length == 0) {
                d3.select("#alertMessage").style("visibility", "");
            }
            else {
                d3.select("#alertMessage").style("visibility", "hidden");
            }
            
            // Como year es "All", se puede mostrar la prediccion calculada por lo que se muestra el boton
            d3.select("#sequence3").style("visibility", "");
            d3.select("#prediction").on("click", clickPrediction);
        }
        
        //Actualiza las graficas con datos de un pais y de un año
        else if (country != "All" && year != "All"){
           
            var updatedDataset = datos.filter(function(d) { 
                if (d.timeline.incident.year==year){
                    return(d);
                }  
            });
            var updatedDatamap = prepareDatamap(updatedDataset);
            drawDatamap(updatedDatamap);
            
            var updatedIndustries = datos.filter(function(d) { 
                if (d.victim.country==country && d.timeline.incident.year==year){
                    return(d.victim.industry_name);
                }  
            }).map(function(d) { return d.victim.industry_name; });
            var updatedDatasetBars = prepareData(updatedIndustries, "industries")
            drawBars(svgBars, barChartWidth, barChartHeight, barChartMargin, updatedDatasetBars);

            var updatedActions = datos.filter(function(d) { 
                if (d.victim.country==country && d.timeline.incident.year==year){
                    return(d.action);
                }  
            }).map(function(d) { return d.action; });
            var updatedDatasetActions = prepareSunburst(updatedActions)
            drawSunburst(updatedDatasetActions, svgSunburstActions, sunburstWidth, sunburstHeight, trailActions, explanationActions, percentageActions, numberActions, nodeNamesActions, colorScaleActions);    

            var updatedActors = datos.filter(function(d) { 
                if (d.victim.country==country && d.timeline.incident.year==year){
                    return(d.actor);
                }  
            }).map(function(d) { return d.actor; });
            var updatedDatasetActors = prepareSunburst(updatedActors)
            drawSunburst(updatedDatasetActors, svgSunburstActors, sunburstWidth, sunburstHeight, trailActors, explanationActors, percentageActors, numberActors, nodeNamesActors, colorScaleActors);

            var updatedYears = datos.filter(function(d) { 
                if (d.victim.country==country && d.timeline.incident.year==year){
                    return(d.timeline.incident.year);
                }  
            }).map(function(d) { return d.timeline.incident.year; });
            var updatedDatasetTimeline = prepareData(updatedYears, "years")
            drawTimeline(svgTimeline, timelineWidth, timelineHeight, timelineMargin, updatedDatasetTimeline);
            
            var checkIfData = datos.filter(function(d) { 
                if (d.victim.country==country && d.timeline.incident.year==year){
                    return(d);
                }  
            });
            
            // Si para el pais seleccionado no hay datos de ningun año, aparece mensaje de que no hay datos y se actualizan todas las graficas vacias 
            if (checkIfData.length == 0) {
                d3.select("#alertMessage").style("visibility", "");
            }
            else {
                d3.select("#alertMessage").style("visibility", "hidden");
            }
            
            // No se muestra el boton de prediccion, por estar un año seleccionado
            d3.select("#sequence3").style("visibility", "hidden");
        }
    }
    
    function clickPrediction () {
        
        // Como year es "All", se puede mostrar la prediccion calculada por lo que se cargan los datos y se muestra el boton
        d3.json("data/predictions.json", function (predictions){
            
            if (countryName == "All"){
                var updatedYears = datos.map(function(d) { return d.timeline.incident.year; });
            }
            else {
                var updatedYears = datos.filter(function(d) { 
                    if (d.victim.country==countryName){
                        return(d.timeline.incident.year);
                    }  
                }).map(function(d) { return d.timeline.incident.year; });
            }
            
            var updatedDatasetTimeline = prepareData(updatedYears, "years");
                    
            // Busca el pais seleccionado en dataset de predicciones y se queda con su posicion, para poder asignarle despues el numero de incidentes al objeto prediccion
            var countries = predictions.map(function(d) { return d.country; });
            var countryPosition = countries.indexOf(countryName);
                    
            // Crea el objeto prediccion, que se añadira al dataset original
            var prediction = new Object();
            prediction.year = "2018";
            prediction.incidents = predictions[countryPosition].incidents;
                    
            // Incluye el objeto prediccion en el dataset original
            updatedDatasetTimeline.push(prediction);
                    
            drawTimeline(svgTimeline, timelineWidth, timelineHeight, timelineMargin, updatedDatasetTimeline);
            
        });            
    }
   
})