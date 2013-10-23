<html>
  <head>

    <link href="themes/redmond/jquery-ui-1.8.16.custom.css" rel="stylesheet" type="text/css" />
	<link href="scripts/jtable/themes/lightcolor/blue/jtable.css" rel="stylesheet" type="text/css" />
	
	<script src="scripts/jquery-1.6.4.min.js" type="text/javascript"></script>
    <script src="scripts/jquery-ui-1.8.16.custom.min.js" type="text/javascript"></script>
    <script src="scripts/jtable/jquery.jtable.js" type="text/javascript"></script>
	
  </head>
  <body>
	<div id="PeopleTableContainer" style="width: 600px;"></div>
	<script type="text/javascript">

		$(document).ready(function () {

		    //Prepare jTable
			$('#PeopleTableContainer').jtable({
                title: 'Table of people',
                paging: true, //Enable paging
                pageSize: 10, //Set page size (default: 10)
                sorting: true, //Enable sorting
                defaultSorting: 'Autor ASC', //Set default sorting
				actions: {
					listAction: 'PersonActions.php?action=list'//,
					//createAction: 'PersonActions.php?action=create',
					//updateAction: 'PersonActions.php?action=update',
					//deleteAction: 'PersonActions.php?action=delete'
				},
				fields: {
					id: {
						key: true,
						create: false,
						edit: false,
						list: false
					},
					Localidade: {
						title: 'Localidade',
						width: '30%'
					},
					UF: {
						title: 'UF',
						width: '10%'
					},
                    ValorSolicitado: {
						title: 'valor',
						width: '30%'
                    },
                    Autor: {
                        title: 'autor',
                            width: '20%'
                    },
                    Partido: {
                        title: 'partido',
                        width: '10%'
                    }
				}
			});

			//Load person list from server
			$('#PeopleTableContainer').jtable('load');

		});

	</script>
 
  </body>
</html>
