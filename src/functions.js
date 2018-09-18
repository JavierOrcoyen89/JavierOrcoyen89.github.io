// Prepara los datos para ser representados en el mapa
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

// Prepara los datos para ser representados en el grafico de barras o el temporal (en funcion del valor del parametro "key")
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

// Dibuja el grafico de barras
function drawBars (svg, width, height, margin, datasetBars) {
        
    // Ordena las barras en funcion de su valor
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

    // Hace que el eje Y muestre nombres, sin ticks
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    svg.append("g")
        .attr("class", "yAxisBars")
          
            
    var bars = svg.selectAll(".bar")
        .data(datasetBars) 
            
    // Incluye los rectangulos
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
                .attr("fill", "#032D58") 
                .attr("stroke-width",1.5);    
        })
        .on("mouseout",function(){
            d3.select(this)
                .attr("fill", "#00113B")
                .attr("stroke-width",0);                          
        })
            
    // Incluye los rectangulos (se vuelve a repetir este trozo para que se reajuste la anchura de las barras)
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
            
    // Incluye etiquetas a la derecha de cada barra
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
        // Posicion Y de la etiqueta a la mitad de la barra
        .attr("y", function (d) {
            return y(d.industry_name) + y.rangeBand() * 0.5 + 4;
        })
        // Posicion X de la etiqueta 30 pixeles a la derecha de la barra
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
            
}

// Prepara los datos para ser representados en grafico de proyeccion solar
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

// Dibuja grafico de proyeccion solar
function drawSunburst (nodeData, svg, width, height, trail, explanation, percentage, nodes, color) {
        
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
        
    // Estructura de los datos
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);

    // Encuentra la raiz
    var root = d3.hierarchy(nodeData)
        .sum(function (d) { return d.size});

    // Dimensiones de los arcos
    partition(root);
    var arc = d3.arc()
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1 })
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });
      
    // Se vuelve a utilizar la version 3 de D3
    d3 = d3version3;
        
    // Incluye los arcos
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
    
    // Incluye evento mouseleave a los arcos
    svg.selectAll("path")
        .on("mouseover", function (d) {
            mouseover(d, sizeTotal, svg, width, height, trail, explanation, percentage, nodes, color);
        });
        
    // Incluye evento mouseleave a los arcos
    svg.on("mouseleave", function (d) {
        mouseleave(d, sizeTotal, svg, width, height, trail, explanation, percentage, nodes, color);
    });  
}
      
// Aclara todos los arcos excepto el seleccionado, y aparece la leyenda
function mouseover(d, size, svg, width, height, trail, explanation, percentage, nodes, color) {
        
    var percentageValue = d3.round((100 * d.value / size).toPrecision(3),1);
    var percentageString = percentageValue + "%";
    if (percentageValue < 0.1) {
        percentageString = "< 0.1%";
    }
        
    explanation.style("visibility", "");
        
    percentage.text(percentageString);
           
    var sequenceArray = getAncestors(d);
    updateBreadcrumbs(sequenceArray, percentageString, width, height, trail, nodes, color);
        
    // Aclara los arcos
    svg.selectAll("path")
        .style("opacity", 0.3);

    // Solo mantiene color de los ancestros del arco sobre el que se haga mouseover
    svg.selectAll("path")
        .filter(function(node) {
            return (sequenceArray.indexOf(node) >= 0);
         })
        .style("opacity", 1);
}

// Restaura todo a opacidad total cuando te vas de la visualizacion
function mouseleave(d, size, svg, width, height, trail, explanation, percentage, nodes, color) {
        
    // Esconde la leyenda
    trail.style("visibility", "hidden");

    // Desactiva los arcos durante la transicion
    svg.selectAll("path").on("mouseover", null);

    // Transicion de cada elemento a opacidad total y luego los reactiva
    svg.selectAll("path")
        .transition()
        .duration(10)
        .style("opacity", 1)
        .each("end", function() {
            d3.select(this).on("mouseover", function (d) {
                mouseover(d, size, svg, width, height, trail, explanation, percentage, nodes, color);
            })
        });

    explanation.style("visibility", "hidden");
}

// Actualiza leyenda para mostrar la secuencia actual y porcentaje en centro de la proyeccion
function updateBreadcrumbs(nodeArray, percentageString, width, height, trail, nodes, color) {
        
    var b = {
        w: width * 0.4, h: height * 0.08, s: 15, t: 10
    };
        
    // Data join: funcion que combina nombre y posicion en secuencia (profundidad)
    var g = trail.selectAll("g")
        .data(nodeArray, function(d) { return d.data.name + d.depth; });
    
    // Incluye etiqueta y leyenda
    var entering = g.enter().append("svg:g");
       
    entering
        .append("svg:polygon")
        .attr("points", function(d, i){
            // Genera string que describe los puntos del poligono
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // No incluye sexto vertice en ultimo poligono
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

    // Posicion para incluir y actualizar nodos
    g.attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Elimina nodos existentes
    g.exit().remove();

    // Mueve y actualiza porcentaje al final de leyenda
    trail.select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s) * 0.95)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .text(percentageString);

    // Si esta escondida, hace que la leyenda sea visible
    trail
        .style("visibility", "");
}

// Dado un nodo, devuelve un array con todos sus ancestros, excluyendo raiz
function getAncestors(node) {
        
    var path = [];
    var current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

// Dibuja grafico temporal
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
        
    // Ordena en funcion del valor
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
        
    // Define las escalas
    var x = d3.time.scale()
        .range([0, width])
        .domain(d3.extent(data, function(d) { return d.year; }));

    var y = d3.scale.linear()
        .range([height, margin.top * 0.5])
        .domain([0, d3.max(data, function(d) { return d.incidents; })]);

    // Define la linea
    var valueline = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.incidents); });

    // Define el area
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
        
    // Si el dataset viene con la prediccion para 2018, lo incluye en la grafica
    if (uniqueYears.includes("2018")){
            
        var prediction = [];
        prediction.push(data[data.length-2]);
        prediction.push(data[data.length-1]);
            
        var rest = data.slice(0);
        rest.splice(rest.length-1,1);
           
        // Incluye area
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
            .attr("transform", "translate("+ margin.left + "," + margin.top * 0.9 + ")");
            
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
            
        // Incluye el area
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

    // Incluye eje X, forzando que los intervalos sean anuales
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
        
    // Incluye eje Y
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