var margin = {top: 2, right: 2, bottom: 2, left: 2},
    largura = $(window).width(),
    width = largura*0.95 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    paridadeOrigem = false,
    paridadeDestino = true;

var formatNumber = d3.format(",.2f"),
    format = function(d) { return "R$" + formatNumber(d).replace(/,/g,"."); },
    //color = d3.scale.category20(),
    formatName = function(text) { return text.split(' ').join('_'); },
    color = {
        "Receita Bruta": edados_colors["C8"],
        "Royalties": edados_colors["C12"],
        "Custo de Extração": edados_colors["C11"],
        "Óleo Governo": edados_colors["C10"],
        "Óleo Consórcio": edados_colors["B12"],
        "IR": edados_colors["B11"],
        "CSLL": edados_colors["B10"],
        "Lucro Final do Consórcio": "#cc2222",//edados_colors["A12"],
        "Petrobrás": edados_colors["A11"],
        "Shell": edados_colors["A5"],
        "Total": edados_colors["A5"],
        "CNPC": edados_colors["A5"],
        "CNOOC": edados_colors["A5"],
        "Dividendos Gov sobre Lucro Petrobras": edados_colors["A10"],
        "Resultado final do Governo": edados_colors["A8"]
    };

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(150)
    .nodePadding(5)
    .size([width, height]);

var path = sankey.link();

d3.json("dados/presal.json", function(emendas) {
    for (var i in emendas.links) {
        // multiplicar os dy's por 1.1 (+10%)
    }

  sankey
      .nodes(emendas.nodes)
      .links(emendas.links)
      .layout(100);

  var link = svg.append("g").selectAll(".link")
      .data(emendas.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("data-linkings", function(d) { return formatName(d.source.name) + " " + formatName(d.target.name); })
      .attr("d", path)
      .attr("data-index", function(d, index) { console.log(d.source.name, d.target.name, d.dy); return ""; })
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) {
            return b.dy - a.dy;
      });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + " - " + format(d.value); });

  var node = svg.append("g").selectAll(".node")
      .data(emendas.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("data-links", function(d) {
          var links = "";
          try {
            for (var idx in d.targetLinks) {
              links += formatName(d.targetLinks[idx].source.name);
              links += " ";
            }
          } catch(err){}
          try {
            for (var idx in d.sourceLinks) {
              links += formatName(d.sourceLinks[idx].target.name);
              links += " ";
            }
          }catch(err){}
          return $.trim(links);
      })
      .on("mouseover", adiciona_destaque_partido)
      .on("click", adiciona_destaque_partido)
      .on("mouseout", remove_destaque_partido);

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .attr("id", function(d) { return formatName(d.name) + "-box"; })
      .attr("data-from", function(d) {
          var origens = "";
          try {
            for (var idx in d.targetLinks) {
              origens += formatName(d.targetLinks[idx].source.name);
              origens += " ";
            }
          }catch(err){}
          return $.trim(origens);
        })
      .attr("data-to", function(d) {
          var destinos = "";
          try {
            for (var idx in d.sourceLinks) {
              destinos += formatName(d.sourceLinks[idx].target.name);
              destinos += " ";
            }
          }catch(err){}
          return $.trim(destinos);
        })
      .style("fill", function(d) { return d.color = color[d.name]; })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
      .style("data-color", function(d) { return d.color = color[d.name]; })
      .style("data-highlighted", 0)
    .append("title")
      .text(function(d) { return d.name + " - " + format(d.value); });

  node.append("text")
      .attr("x", sankey.nodeWidth()/2)
      .attr("y", function(d) { return (d.dy / 2) - 6; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", null)
      .text(function(d) { return d.name; });
  
  node.append("text")
      .attr("x", sankey.nodeWidth()/2)
      .attr("y", function(d) { return (d.dy / 2) + 6; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", null)
      .attr("id", function(d) { return formatName(d.name)+"-valor";})
      .attr("data-type", "valor")
      .text(function(d) { return format(d.value); });

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  function adiciona_destaque_partido(d) {
    var cor_partido_selecionado = $('#'+formatName(d.name)+'-box')[0].style.stroke;
    $("[data-linkings~='"+formatName(d.name)+"']").attr("class","link destaquePartido");
    $("[data-to~='"+formatName(d.name)+"']").each(function(index) { destColor(d, index); } );
    //$("[data-from~='"+formatName(d.name)+"']").each(function(index) { addDestino(d, index); } );
    //$("[data-links*='"+formatName(d.name)+"']").each(function(index){console.log(this)});
    $(".node").each(function(){this.style.opacity = 0.6;});
    $("[id='"+formatName(d.name)+"-box']").parent().each(function(){ this.style.opacity = 1; });
    $("[data-links*='"+formatName(d.name)+"']").each(function(){ this.style.opacity = 1; });
  }

  function remove_destaque_partido(d) {
    $("[data-linkings*='"+formatName(d.name)+"']").attr("class","link");
    $(".node").each(function(){this.style.opacity = 1;});
    //$("[data-highlighted=1]").style("stroke-opacity","1");
    //$("[data-highlighted=1]").attr("data-highlighted",0);
  }

  function destColor(d, index) {
    //console.log("[data-from='"+formatName(d.name)+"']");
    //console.log($("[data-from='"+formatName(d.name)+"']"));
  }

  function addDestino(d, index) {
    //console.log($("[data-to='"+formatName(d.name)+"']"));
  }

});



