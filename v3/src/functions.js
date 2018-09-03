//Prepara los datos para ser representados en el mapa
function prepareDatamap (data) {
     // Datamaps expect data in format: { "USA": { "fillColor": "#42a844", numberOfWhatever: 75}, "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
     var dataset = {};
    
     // Array donde cada posicion es el pais donde ha ocurrido cada uno de los incidentes    
     var countries = data.map(function(d) { return(d.victim.country) })
     
     // Listado de clave / valor donde se indican los incidentes ocurridos en cada pais. El operador coma evalua cada uno de sus operandos (de izquierda a derecha) y devuelve el valor del ultimo operando
     // Por tanto, esto incrementa el valor de prev[curr] o lo inicializa a 1, despues devuelve prev. Idea obtenida de: https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
     var incidentsPerCountry = countries.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {})
     // Listado de paises unicos que aparecen en el dataset (sobre los que hay datos)
     var uniqueCountries = Object.keys(incidentsPerCountry);
     // Listado de la cuenta de incidentes en cada pais
     var countOfIncidentsPerCountry = Object.keys(incidentsPerCountry).map(key => incidentsPerCountry[key]);
    
     // Crear escala para colorear cada pais en funcion del numero de incidentes ocurridos
     var minValue = Math.min.apply(null, countOfIncidentsPerCountry);
     var maxValue = Math.max.apply(null, countOfIncidentsPerCountry);

     // Crear paleta de colores utilizando escala logaritmica, ya que si se usa linear hay demasiada diferencia entre USA y el resto (en el ejemplo origen utiliza colores ["#EFEFFF","#02386F"]) 
     var paletteScale = d3.scale.log()
         .domain([minValue,maxValue])
         .range(["#0DB6DC","#032D58"]); 

     // Rellenar dataset de la forma que espera la libreria Datamap: { "USA": { "fillColor": "#42a844", numberOfWhatever: 75}, "FRA": { "fillColor": "#8dc386", numberOfWhatever: 43 } }
     uniqueCountries.forEach(function(item){
         // Indica el pais
         var country = item;
         // Indica el numero de incidentes ocurridos en el pais indicado en country, para ello se va al array de incidentes y busca el valor que haya en la posicion que tenga country en array de paises
         var incidents = countOfIncidentsPerCountry[uniqueCountries.indexOf(item)];

         // Rellena el dataset de la forma que espera Datamap
         dataset[country] = { numberOfIncidents: incidents, fillColor: paletteScale(incidents) };
     });

     return dataset;
}

//Prepara los datos para ser representados en el grafico de barras o el temporal (en funcion del valor del parametro "key")
function prepareData (data, key) {

     // Listado clave / valor donde se indican los incidentes ocurridos en cada clave. El operador coma evalua cada uno de sus operandos (de izquierda a derecha) y devuelve el valor del ultimo operando
     // Esto incrementa el valor de prev[curr] o lo inicializa a 1, despues devuelve prev. Idea obtenida de: https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
     var incidentsPerKey = data.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {})
     // Listado de claves unicas
     var uniqueKeys = Object.keys(incidentsPerKey);
     // Listado de la cuenta de incidentes en cada clave
     var countOfIncidentsPerKey = Object.keys(incidentsPerKey).map(key => incidentsPerKey[key]);
     // Definir el dataset como array para poder acceder a los atributos y aplicar funcion map
     var dataset = [];
     // Rellenar dataset de la forma que esperan el grafico de barras y el temporal: { "key": "Key1", "size": 75}, { "key": "key2", "size": 43 }
     uniqueKeys.forEach(function(item){
         // Indica la clave
         var keyValue = item;
         // Indica numero de incidentes ocurridos en la clave indicada en industry, para ello se va al array de incidentes y busca valor que haya en la posicion que tenga industry en array de industrias
         var incidents = countOfIncidentsPerKey[uniqueKeys.indexOf(item)];

         // Rellena el dataset de la forma que espera el grafico de barras
         if (key == "industries"){   
             dataset[uniqueKeys.indexOf(item)] = { industry_name: keyValue, incidents: incidents };
         }
         // Rellena el dataset de la forma que espera el grafico temporal
         else if (key == "years"){   
             dataset[uniqueKeys.indexOf(item)] = { year: keyValue, incidents: incidents };
         }
     });
     return dataset;    
 }

function drawBars (svg, width, height, margin, datasetBars) {
        
     //sort bars based on value
     datasetBars = datasetBars.sort(function (a, b) {
         return d3.ascending(a.incidents, b.incidents);
     });
            
     var x = d3.scale.linear()
         .range([0, width-margin.right])
         .domain([0, d3.max(datasetBars, function (d) {
             return d.incidents;
         })]);

     var y = d3.scale.ordinal()
         .rangeRoundBands([height, 0], .1)
         .domain(datasetBars.map(function (d) {
             return d.industry_name;
         }));

     //make y axis to show bar names, with no tick marks
     var yAxis = d3.svg.axis()
         .scale(y)
         .tickSize(0)
         .orient("left");

     svg.append("g")
         .attr("class", "yAxisBars")
          
            
     var bars = svg.selectAll(".bar")
         .data(datasetBars) 
            
     //append rects
     bars
         .enter()
         .append("rect")
         .attr("class", "bar")
         .attr("x", 0)
         .attr("y", 0)
         .attr("fill", "#00113B")
         .transition()
         .duration(1000)
         .attr("y", function (d) {
             return y(d.industry_name);
         })
         .attr("height", y.rangeBand())
         .attr("x", 0)
         .attr("width", function (d) {
             return x(d.incidents);
         });
        
     bars
         .on("mouseover", function(d){
             d3.select(this)
                 .attr("stroke","#78D2FE")
                 .attr("fill", "#032D58") //#095994, #032D58
                 .attr("stroke-width",1.5);    
         })
         .on("mouseout",function(){
             d3.select(this)
                 .attr("fill", "#00113B")
                 .attr("stroke-width",0);                          
     })
            
        //append rects (se vuelve a repetir este trozo para que se reajuste la anchura de las barras)
    bars
        .transition()
        .duration(1000)
        .attr("y", function (d) {
            return y(d.industry_name);
        })
        .attr("height", y.rangeBand())
        .attr("x", 0)
        .attr("width", function (d) {
            return x(d.incidents);
        });
            
    bars
        .exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .attr("x", width)
        .remove();
            
    //add a value label to the right of each bar
    var labels = svg.selectAll(".label")
        .data(datasetBars);

    labels
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("opacity", 0)
        .attr('x', 0)
        .attr('y', 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1)

    labels
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        //y position of the label is halfway down the bar
        .attr("y", function (d) {
            return y(d.industry_name) + y.rangeBand() * 0.5 + 4;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function (d) {
            return x(d.incidents) + 30;
        })
        .text(function (d) {
            return d.incidents;
        });
            
    labels
        .exit()
        .transition()
        .duration(1000)
        .attr('x', width)
        .attr('opacity', 0)
        .remove();
            
    svg.select(".yAxisBars")
        .transition()
        .duration(1000)
        .call(yAxis);
            
    // Si quieres que las barras cambien de opacidad
    //var colorScale = d3.scale.log()
    //    .domain([d3.min(datasetBars, function (d) { return d.incidents; }), d3.max(datasetBars, function (d) { return d.incidents; })])
    //    .range([0.3,1])
    // bars.attr("opacity", d => colorScale(d.incidents));
}
    
function prepareSunburst (nodes) {
    
    // Preparar los hijos del primer nodo de la forma que espera el sunburst: [{ "name": "A1", "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]}]
    var datasetSunburst = [];

    var auxNode = {};
    var auxVariety = {};

    // Idea de https://stackoverflow.com/questions/17780508/selecting-distinct-values-from-a-json y https://stackoverflow.com/questions/8963693/how-to-create-json-string-in-javascript
    nodes.forEach(function(item){ 
        // Recorre cada elemento (nodeo) del array
        for (node in item) {
            // En el caso en el que el nodo no este aun incluido en el dataset, se incluye al nodo y todas sus variedades (si tiene)
            if (!(node in auxNode)){    
                // Crear el objeto nodo
                var objNode = new Object();
                objNode.name = node;
                // Si el nodo no tiene variedades (hijos), es un nodo hoja y se incluye el atributo size
                if (!item[node].variety){
                    objNode.size = 1;
                }
                // Si el nodo tiene variedades, se incluyen como nodos hoja
                else{
                    objNode.children = [];
                    // Recorrer las variedades del nodo para incluirlas como hijos del objeto nodo
                    for (variety in item[node].variety){
                        var objVariety = new Object();
                        objVariety.name = item[node].variety[variety];
                        objVariety.size = 1;
                        objNode.children.push(objVariety);
                        auxVariety[node + " " + item[node].variety[variety]] = 1;
                    }
                }
                datasetSunburst.push(objNode)
                auxNode[node] = 1
            }
            // En el caso en el que el nodo ya este incluido en el dataset, hay que incluir las variedades nuevas de ese nodo y sumar 1 a las variedades que ya esten en el dataset
            else{
                // Si el nodo no tiene variedades (hijos), es un nodo hoja y se suma 1 al atributo size
                if (!item[node].variety){
                    var foundNode = datasetSunburst.find(function(element) {
                        return element.name === node;
                    });
                    foundNode.size = foundNode.size + 1;
                }
                // Si el nodo tiene variedades, se comprueba si hay que incluirlos como nodos hoja o aumentar su atributo size
                else{                
                    for (variety in item[node].variety){
                        // Inlcuir las variedades nuevas del nodo
                        if (!(node + " " + item[node].variety[variety] in auxVariety)) {
                            var objVariety = new Object();
                            objVariety.name = item[node].variety[variety];
                            objVariety.size = 1;
                            // Buscar el objeto nodo en el dataset para hacerle el push de las nuevas variedades
                            var foundNode = datasetSunburst.find(function(element) {
                                return element.name === node;
                            });
                            foundNode.children.push(objVariety);
                            auxVariety[node + " " + item[node].variety[variety]] = 1;
                        }
                        // Sumar 1 al atributo size de las variedades que ya estan incluidas en el dataset
                        else {
                            // Buscar el objeto nodo en el dataset para despues buscar la variedad
                            var foundNode = datasetSunburst.find(function(element) {
                                return element.name === node;
                            });
                            // Buscar el objeto variedad para aumentar en 1 su size
                            var foundVariety = foundNode.children.find(function(element) {
                                return element.name === item[node].variety[variety];
                            });
                            foundVariety.size = foundVariety.size + 1;
                        }
                    }
                }
            }
        } 
    });
        
    // Asegurar que el nombre de los nodos empieza por mayuscula
    datasetSunburst.forEach(function(item){
        item.name = item.name.substr(0,1).toUpperCase() + item.name.substr(1,item.name.length);
    });
  
    // Incluir nodo raiz del dataset, de la forma que espera el sunburst: { "name": "ROOT", "children": [{ "name": "A1", "children": [{"name": "Sub A1", "size": 4}, {"name": "Sub A2", "size": 4}]}]}
    var datasetSunburstFinal = new Object();
    datasetSunburstFinal.name = "ROOT";
    datasetSunburstFinal.children = datasetSunburst;
        
    return datasetSunburstFinal;
}

function drawSunburst (nodeData, svg, width, height, trail, explanation, percentage, number, nodes, color) {
        
      // Almacena la suma de todos los apartados 'size' del dataset 
      var sizeTotal = 0;
        
      nodeData.children.forEach(function (item){ 
          if(item.children){
              item.children.forEach(function (element){
                  sizeTotal = sizeTotal + element.size;
                  
              });
          }
          else{
              sizeTotal = sizeTotal + item.size;
          }
      });
       
      // Esta parte de la funcion utiliza la version 4 de D3
      d3 = d3version4;

      svg.selectAll("*")
          .remove();
        
      var radius = Math.min(width, height) * 0.5;
        
      // Data strucure
      var partition = d3.partition()
          .size([2 * Math.PI, radius]);

      // Find data root
      var root = d3.hierarchy(nodeData)
          .sum(function (d) { return d.size});

      // Size arcs
      partition(root);
      var arc = d3.arc()
          .startAngle(function (d) { return d.x0 })
          .endAngle(function (d) { return d.x1 })
          .innerRadius(function (d) { return d.y0 })
          .outerRadius(function (d) { return d.y1 });
      
      // Se vuelve a utilizar la version 3 de D3
      d3 = d3version3;
        
      // Put it all together
      var path = svg.selectAll("path")
          .data(root.descendants())
          .enter()
          .append("path")
          .transition()
          .duration(1000)
          .attr("class", "borderSunburst")
          .attr("display", function (d) { return d.depth ? null : "none"; })
          .attr("d", arc)
          .style("fill", function (d) { 
              // Se comprueba para caso para aplicar la escala de color
              var index = 0;
              if (d.data.name != "ROOT"){
                  if (d.parent.data.name == "ROOT" && nodes.includes(d.data.name) && !d.children){
                     
                      index = nodes.indexOf(d.data.name);
                      }
                   else if (nodes.includes(d.data.name) && d.children){
                      
                      index = nodes.indexOf(d.data.name);
                      }   
                  else if (nodes.includes(d.parent.data.name)) {
                       
                      index = nodes.indexOf(d.parent.data.name)
                  }    
              }
              return color(index);
               
          });
        
      svg.selectAll("path")
          .on("mouseover", function (d) {
              mouseover(d, sizeTotal, svg, width, height, trail, explanation, percentage, number, nodes, color);
          });
        
      // Add the mouseleave handler to the bounding circle.
      svg.on("mouseleave", function (d) {
          mouseleave(d, sizeTotal, svg, width, height, trail, explanation, percentage, number, nodes, color);
      });  
  }
      
// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString, width, height, trail, nodes, color) {
        
    var b = {
        w: width * 0.4, h: height * 0.08, s: 15, t: 10
    };
        
    // Data join; key function combines name and depth (= position in sequence).
    var g = trail.selectAll("g")
        .data(nodeArray, function(d) { return d.data.name + d.depth; });
    
    // Add breadcrumb and label for entering nodes.
    var entering = g.enter().append("svg:g");
       
    entering
        .append("svg:polygon")
        .attr("points", function(d, i){
            // Generate a string that describes the points of a breadcrumb polygon.
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(b.t + "," + (b.h / 2));
            }
            return points.join(" ");
        })
        .style("fill", function (d) { 
            // Se comprueba para caso para aplicar la escala de color
            var index = 0;
            if (d.data.name != "ROOT"){
                if (d.parent.data.name == "ROOT" && nodes.includes(d.data.name) && !d.children){
                   
                    index = nodes.indexOf(d.data.name);
                    }
                 else if (nodes.includes(d.data.name) && d.children){
                    
                    index = nodes.indexOf(d.data.name);
                    }   
                else if (nodes.includes(d.parent.data.name)) {
                   
                    index = nodes.indexOf(d.parent.data.name)
                }    
            }
            return color(index);
        })
        .attr("stroke", "#FFFFFF");

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("class", "textSunburst")
        .attr("dy", "0.35em")
        .text(function(d) { return d.data.name; });

    // Set position for entering and updating nodes.
    g.attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
    g.exit().remove();

    // Now move and update the percentage at the end.
    trail.select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s) * 0.95)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .text(percentageString);

    // Make the breadcrumb trail visible, if it's hidden.
    trail
        .style("visibility", "");
}

// Given a node in a partition layout, return an array of all of its ancestor nodes, highest first, but excluding the root.
function getAncestors(node) {
        
        var path = [];
        var current = node;
        while (current.parent) {
            path.unshift(current);
            current = current.parent;
        }
        return path;
    }

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d, size, svg, width, height, trail, explanation, percentage, number, nodes, color) {
        
        var percentageValue = d3.round((100 * d.value / size).toPrecision(3),1);
        var percentageString = percentageValue + "%";
        if (percentageValue < 0.1) {
            percentageString = "< 0.1%";
        }
        
        explanation.style("visibility", "");
        
        percentage.text(percentageString);
        
        number.text(d.value);
       
        var sequenceArray = getAncestors(d);
        updateBreadcrumbs(sequenceArray, percentageString, width, height, trail, nodes, color);
        
        // Fade all the segments.
        svg.selectAll("path")
            .style("opacity", 0.3);

        // Then highlight only those that are an ancestor of the current segment.
        svg.selectAll("path")
            .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
             })
            .style("opacity", 1);
    }

 // Restore everything to full opacity when moving off the visualization.
function mouseleave(d, size, svg, width, height, trail, explanation, percentage, number, nodes, color) {
        
        // Hide the breadcrumb trail
        trail.style("visibility", "hidden");

        // Deactivate all segments during transition.
        svg.selectAll("path").on("mouseover", null);

        // Transition each segment to full opacity and then reactivate it.
        svg.selectAll("path")
            .transition()
            .duration(10)
            .style("opacity", 1)
            .each("end", function() {
                d3.select(this).on("mouseover", function (d) {
                    mouseover(d, size, svg, width, height, trail, explanation, percentage, number, nodes, color);
                })
            });

        explanation.style("visibility", "hidden");
    }

function drawTimeline(svg, width, height, margin, data){      
    
        // Listado de años unicos que aparecen en el dataset (sobre los que hay datos)
        var uniqueYears = data.map(function(d) { return(d.year) });
    
        // Listado de todos los años sobre los que hay datos en el dataset inicial
        var totalYears = ["2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017"];
        
        // Completa el dataset con los años para los que no haya incidentes, incluyendolos como 0
        for (y in totalYears) {
            if (!uniqueYears.includes(totalYears[y])) {
                var missedYear = new Object();
                missedYear.year = totalYears[y];
                missedYear.incidents = 0;
                data.push(missedYear);
            }
        }
        
        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.year, b.year);
        })
        
        var parseTime = d3.time.format("%Y").parse;
        var bisectDate = d3.bisector(function(d) { return d.year; }).left;
        
        // Convierte cada string anual a formato fecha (1 de enero que indique d.year)
        data.forEach(function(d) {
            d.year = parseTime(d.year);
            d.incidents = +d.incidents;
        });
        
        // set the ranges and scale the range of the data
        var x = d3.time.scale()
            .range([0, width])
            .domain(d3.extent(data, function(d) { return d.year; }));

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(data, function(d) { return d.incidents; })]);

        // define the line
        var valueline = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.incidents); });

        // define the area
        var area = d3.svg.area()
            .x(function(d) { return x(d.year); })
            .y0(height)
            .y1(function(d) { return y(d.incidents); });
    
        svg
            .append("path")
            .data([data])
            .attr("class", "line")
            .attr("transform", "translate("+ margin.left + "," + margin.top + ")");
        
        svg
            .select(".line")
            .transition()
            .duration(1000)
            .attr("d", valueline(data))
        
        if (uniqueYears.includes("2018")){
            
            var prediction = [];
            prediction.push(data[data.length-2]);
            prediction.push(data[data.length-1]);
            
            var rest = data.slice(0);
            rest.splice(rest.length-1,1);
           
            // add the area
            svg
                .append("path")
                .data([rest])
                .attr("class", "area")    
                .attr("transform", "translate("+ margin.left + "," + margin.top + ")");
            
            svg
                .select(".area")
                .transition()
                .duration(1000)
                .attr("d", area(rest)); 
            
            svg
                .append("path")
                .data([prediction])
                .attr("class", "areaPrediction") 
                .attr("fill", "red")
                .attr("transform", "translate("+ margin.left + "," + margin.top + ")");
            
            svg
                .select(".areaPrediction")
                .transition()
                .duration(1000)
                .attr("d", area(prediction));
        }
        else {
            
            svg
                .select(".areaPrediction")
                .remove();
            
            // add the area
            svg
                .append("path")
                .data([data])
                .attr("class", "area")    
                .attr("transform", "translate("+ margin.left + "," + margin.top + ")");
            
            svg
                .select(".area")
                .transition()
                .duration(1000)
                .attr("d", area(data)); 
        }

        // Add the X Axis, forzando que los intervalos sean anuales
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.years, 1);

        svg
            .append("g")
            .attr("transform", "translate("+ margin.left + "," + (margin.top + height) + ")")
            .attr("class", "axisTimeline")
            .attr("id", "xAxisTimeline");
        
        svg
			.select("#xAxisTimeline")
            .transition()
            .duration(1000)
            .call(xAxis);
 
        // Evita que aparezcan ticks vacios en el eje Y
        var numberOfIncidents = data.map(function(d) { return d.incidents; });
        var maxIncident = Math.max.apply(null, numberOfIncidents);    
    
        var tickNumber = 0; 
        
        if (maxIncident <= 4) {
            tickNumber = maxIncident;
        }
        
        else {
            tickNumber = data.length-1;
        }
        
        // Add the Y Axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(tickNumber)
            .tickFormat(d3.format(",d"));
        
         svg
            .append("g")
            .attr("transform", "translate("+ margin.left + "," + margin.top + ")")
            .attr("class", "axisTimeline")
            .attr("id", "yAxisTimeline");
        
        svg
			.select("#yAxisTimeline")
            .transition()
            .duration(1000)
            .call(yAxis); 
    
        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");
            
        focus.append("line")
            .attr("class", "hover-line")  
    
        focus.append("circle")
            .attr("r", 10);
            
        focus.append("text")
            .attr("class", "textTimeline")
            .attr("x", 0)
            .attr("y", 30)
            .attr("dy", "0.35em")

        svg.append("rect")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "overlay")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", function () {
                var x0 = x.invert(d3.mouse(this)[0]);
                var i = bisectDate(data, x0, 1);
                var d0 = data[i - 1];
                var d1 = data[i];
                var d = x0 - d0.year > d1.year - x0 ? d1 : d0;
                
                // Mueve todo el contenido de focus (linea, circulo y texto) a la posicion (year, incidents) sobre la que este el raton
                focus.attr("transform", "translate(" + (x(d.year) + margin.left)  + "," + (y(d.incidents) + margin.top) + ")");
                focus.select("text").text(function() { return d.incidents; });
                // Ajusta las dimensiones de la linea
                focus.select(".hover-line").attr("y2", height  - y(d.incidents));
        }); 
    }