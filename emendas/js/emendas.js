var margin = {top: 1, right: 1, bottom: 1, left: 1},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    paridadeOrigem = false,
    paridadeDestino = true;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return "R$" + formatNumber(d).replace(/,/g,"."); },
    //color = d3.scale.category20(),
    formatName = function(text) { return text.split(' ').join('_'); },
    color = {
        "Total de emendas": edados_colors["C8"],
        "PMDB": edados_colors["C12"],
        "PT": edados_colors["C11"],
        "PSDB": edados_colors["C10"],
        "PSD": edados_colors["B12"],
        "PP": edados_colors["B11"],
        "PR": edados_colors["B10"],
        "DEM": edados_colors["A12"],
        "PSB": edados_colors["A11"],
        "PDT": edados_colors["A10"],
        "Outros partidos": edados_colors["A8"],
        "Ministério da Saúde": edados_colors["A7"],
        "Ministério das Cidades": edados_colors["A7"],
        "Ministério do Turismo": edados_colors["A7"],
        "Ministério da Agricultura": edados_colors["A7"],
        "Ministério do Esporte": edados_colors["A7"],
        "Ministério da Educação": edados_colors["A7"],
        "Ministério da Integração Nacional": edados_colors["A7"],
        "Ministério da Defesa": edados_colors["A7"],
        "Ministério da Cultura": edados_colors["A7"],
        "Outros ministérios": edados_colors["A7"],
        "Região Sudeste": edados_colors["A6"],
        "Região Nordeste": edados_colors["A6"],
        "Região Sul": edados_colors["A6"],
        "Região Norte": edados_colors["A6"],
        "Região Centro-Oeste": edados_colors["A6"],
        "Programas nacionais": edados_colors["A6"]
    };

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(110)
    .nodePadding(10)
    .size([width, height]);

var path = sankey.link();

d3.json("dados/emendas.json", function(emendas) {

  sankey
      .nodes(emendas.nodes)
      .links(emendas.links)
      .layout(0);

  var link = svg.append("g").selectAll(".link")
      .data(emendas.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("data-links", function(d) { return formatName(d.source.name) + " " + formatName(d.target.name); })
      .attr("data-source", function(d) { return formatName(d.source.name); })
      .attr("data-target", function(d) { return formatName(d.target.name); })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) {
            return b.dy - a.dy;
      });

  link.append("title")
      .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  var node = svg.append("g").selectAll(".node")
      .data(emendas.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("mouseover", adiciona_destaque_partido)
      .on("mouseout", remove_destaque_partido)
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return d.color = color[d.name]; })
      .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
      .attr("x", sankey.nodeWidth()/2)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", null)
      .text(function(d) { return d.name; });
  
  node.append("text")
      .attr("x", sankey.nodeWidth()/2)
      .attr("y", function(d) { return (d.dy / 2) + 4; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("transform", null)
      .attr("data-type", "valor");
  
  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  function adiciona_destaque_partido(d) {
    $('.origens').empty();
    $('.destinos').empty();
    $('h3.dadosHeader').text(d.name);
    $('h4.dadosHeader').text("Total: " + format(d.value));
    $("[data-links~='"+formatName(d.name)+"']").attr("class","link destaquePartido");
    $("[data-target~='"+formatName(d.name)+"']").each(function(index) { addOrigem(d, index); } );
    $("[data-source~='"+formatName(d.name)+"']").each(function(index) { addDestino(d, index); } );
  }

  function remove_destaque_partido(d) {
    $("[data-links*='"+formatName(d.name)+"']").attr("class","link");
  }

  function addOrigem(d, index) {
    var paridade = false;
    if (paridadeOrigem) {
        var paridade = "impar";
        paridadeOrigem = false;
    } else {
        var paridade = "par";
        paridadeOrigem = true;
    }
    var conteudo = d.targetLinks[index].source.name + " → " + format(d.targetLinks[index].value);
    $("<div>", {
            "class": "origem " + paridade,
            title: conteudo,
            alt: conteudo,
            html: conteudo
    }).appendTo('.origens');
  }

  function addDestino(d, index) {
    var paridade = false;
    if (paridadeDestino) {
        var paridade = "impar";
        paridadeDestino = false;
    } else {
        var paridade = "par";
        paridadeDestino = true;
    }
    var conteudo = d.sourceLinks[index].target.name + " → " + format(d.sourceLinks[index].value);
    $("<div>", {
            class: "destino " + paridade,
            title: conteudo,
            alt: conteudo,
            html: conteudo
    }).appendTo('.destinos');
  }

});


