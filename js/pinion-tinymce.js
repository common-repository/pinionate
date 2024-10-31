(function() {

	tinymce.PluginManager.add( 'pinion', function( editor, url ) {

		/**
		 *
		 *  HELPER FUNCTIONS
		 *
		 */

		var protocol = document.location.protocol === "https:" ? "https:" : "http:";
		var apiBaseUrl = protocol + "//api.pinionate.com/api/v1/channels/wordpress";

		// Get attribute from pattern
		function get_attr( pattern, attr ) {
			
			n = new RegExp( attr + '=\"([^\"]+)\"', 'g' ).exec( pattern );
			
			return n ? n[1] : '';
		}

		// Return formatted date
		function item_date( published_at ) {
			
			var months = [
					translation.jan,
					translation.feb,
					translation.mar,
					translation.apr,
					translation.may,
					translation.jun,
					translation.jul,
					translation.aug,
					translation.sep,
					translation.oct,
					translation.nov,
					translation.dec
				],
			    publish_date = new Date( published_at ),
			    published = months[ publish_date.getMonth() ] + ' ' + publish_date.getDate() + ', ' + publish_date.getFullYear();

			return published;

		}


		// Clear search info
		function clear_search_info() {
			

			// Clear search form values
			(jQuery)("#pinion_search").val( '' );
			(jQuery)("#pinion_search_type").val( '' );
			(jQuery)("#pinion_search_sort").val( '' );

			// Set proper placeholder text
			if ( (jQuery)("#pinion_popup_tab_myitems").hasClass( "pinion_active_tab" ) ) {
				(jQuery)("#pinion_search").attr( "placeholder", translation.search_term );
			} else {
				(jQuery)("#pinion_search").attr( "placeholder", "Search a user to see their channels" );
			}

		}

		// Add shortcode to tinyMCE editor (embed new items from the search popup to the tinyMCE editor)
		function pinion_shortcode_embed( itemId, format ) {
			

			if (format == 'size_full') {
				var itemWidth = '100%';
				var itemHeight = '100%';
			} else if (format == 'size_300_600') {
				var itemWidth = '300px';
				var itemHeight = '600px';	
			}

			// Add shortcode to tinyMCE editor
			if ( tinyMCE && tinyMCE.activeEditor ) {
				tinyMCE.activeEditor.selection.setContent( '[pinion id="' + itemId + '" width="' + itemWidth + '" height="' + itemHeight + '"]' );
			}

			// Close pinion search popup
			(jQuery)(".pinion_popup_overlay_container").remove();

			return false;
		}

		// Pinion popup
		function pinion_popup() {
			
			// Create popup structure (using DOM construction for security reasons)
			(jQuery)("<div></div>").addClass( "pinion_popup_overlay_container" ).appendTo( "body" );
			(jQuery)("<div></div>").addClass( "pinion_popup_overlay_bg" ).appendTo( ".pinion_popup_overlay_container" );
			(jQuery)("<div></div>").addClass( "pinion_popup_overlay_border" ).appendTo( ".pinion_popup_overlay_bg" );
			(jQuery)("<div></div>").attr( "id", "pinion_popup" ).appendTo( ".pinion_popup_overlay_border" );

		}

		// Pinion search popup - create popup structure
		function pinion_search_popup_structure() {
			
			// Popup Components
			(jQuery)("<div></div>").attr( "id", "pinion_search_form" ).attr( "name", "search" ).appendTo( "#pinion_popup" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_search_header" ).appendTo( "#pinion_search_form" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_search_input_form" ).appendTo( "#pinion_search_form" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_search_sub_header" ).appendTo( "#pinion_search_form" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_search_results" ).appendTo( "#pinion_search_form" );

			// Header
			(jQuery)("<div></div>").attr( "id", "pinion_popup_close" ).appendTo( "#pinion_search_header" ).click( function(){
			(jQuery)(".pinion_popup_overlay_container").remove(); } );
			(jQuery)("<div></div>").addClass( "pinion_search_logo" ).appendTo( "#pinion_search_header" ).click( function(){
				clear_search_info(); pinion_featured_items( 1 ); } );
				(jQuery)("<span></span>").appendTo( ".pinion_search_logo" ).text( translation.pinion );
				(jQuery)("<nav></nav>").appendTo( "#pinion_search_header" );
				(jQuery)("<div></div>").attr( "id", "pinion_popup_tab_content" ).click( function(){
				clear_search_info(); pinion_featured_items( 1 ); } ).addClass( "pinion_active_tab" ).appendTo( "#pinion_search_header nav" );
				(jQuery)("<div></div>").attr( "id", "pinion_popup_tab_myitems" ).click( function(){
				clear_search_info(); pinion_my_items( 1 );  } ).appendTo( "#pinion_search_header nav" );
				(jQuery)("<span></span>").appendTo( "#pinion_popup_tab_content" ).text( "Pinionate" );
				(jQuery)("<span></span>").appendTo( "#pinion_popup_tab_myitems" ).text( "My Channels" );

			// Input form
			(jQuery)("<input>").attr( "type", "text" ).attr( "id", "pinion_search" ).attr( "class", "pinion_search" ).attr( "name", "pinion_search" ).attr( "size", "16" ).attr( "autocomplete", "off" ).attr( "placeholder", translation.search_term ).appendTo( "#pinion_search_input_form" ).keyup( function(){
			pinion_show_screen(); } );

			// Sub Header
			(jQuery)("<div></div>").addClass( "pinion_search_fields" ).appendTo( "#pinion_search_sub_header" );
			(jQuery)("<input>").attr( "id","pinion_search_user_id" ).attr( "type","hidden" ).appendTo( "#pinion_search_sub_header" );
			(jQuery)("<input>").attr( "id","pinion_search_user_name" ).attr( "type","hidden" ).appendTo( "#pinion_search_sub_header" );
				(jQuery)("<label></label>"  ).attr( "for",   "pinion_search_type" ).addClass( "pinion_search_label" ).appendTo( ".pinion_search_fields" ).text( 'Category' );
				(jQuery)("<select></select>").attr( "name",  "pinion_search_type" ).attr( "id", "pinion_search_type" ).addClass( "pinion_search_type" ).appendTo( ".pinion_search_fields" ).change( function(){
				(jQuery)("#pinion_search").val( '' ); pinion_show_screen(); } );
				(jQuery)("<option></option>").attr( "value", "" ).appendTo( ".pinion_search_type" ).text( 'All' );
				(jQuery)("<option></option>").attr( "value", "news" ).appendTo( ".pinion_search_type" ).text( 'News' );
				(jQuery)("<option></option>").attr( "value", "business" ).appendTo( ".pinion_search_type" ).text( 'Business' );
				(jQuery)("<option></option>").attr( "value", "sports" ).appendTo( ".pinion_search_type" ).text( 'Sports' );
				(jQuery)("<option></option>").attr( "value", "entertainment" ).appendTo( ".pinion_search_type" ).text( 'Entertainment' );
				(jQuery)("<option></option>").attr( "value", "lifestyle" ).appendTo( ".pinion_search_type" ).text( 'Lifestyle' );
				(jQuery)("<option></option>").attr( "value", "shopping" ).appendTo( ".pinion_search_type" ).text( 'Shopping' );

				(jQuery)("<div></div>").attr( "id", "pinion_search_for" ).appendTo( "#pinion_search_sub_header" );
				(jQuery)("<div></div>").addClass( "pinion_search_sub_divider" ).appendTo( "#pinion_search_sub_header" );

		}

		// Pinion item popup - create popup structure
		function pinion_item_popup_structure( width, height, itemId ) {
			
			// Popup Components
			(jQuery)("<form></form>").attr( "id", "pinion_item_form" ).attr( "name", "item" ).appendTo( "#pinion_popup" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_item_header" ).appendTo( "#pinion_item_form" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_item_body" ).appendTo( "#pinion_item_form" );
			(jQuery)("<div></div>"  ).attr( "id", "pinion_item_update" ).appendTo( "#pinion_item_form" );

			// Header
			(jQuery)("<div></div>").attr( "id", "pinion_popup_close" ).appendTo( "#pinion_item_header" ).click( function(){
			(jQuery)(".pinion_popup_overlay_container").remove(); } );

			// Footer
			(jQuery)("<input>").attr( "id", "pinion_item_settings_id" ).attr( "type", "hidden" ).attr( "value", itemId ).appendTo( "#pinion_item_update" );
			(jQuery)("<input>").attr( "id", "pinion_item_settings_width" ).attr( "type", "hidden" ).attr( "value", width ).appendTo( "#pinion_item_update" );
			(jQuery)("<input>").attr( "id", "pinion_item_settings_height" ).attr( "type", "hidden" ).attr( "value", height ).appendTo( "#pinion_item_update" );
			(jQuery)("<div></div>").addClass( "pinion_item_cancel_button" ).appendTo( "#pinion_item_update" ).text( translation.cancel ).click( function() {
			(jQuery)( '.pinion_popup_overlay_container' ).remove(); } );
			(jQuery)("<div></div>").addClass( "pinion_item_update_button" ).appendTo( "#pinion_item_update" ).text( translation.update_item );

			// Content
			(jQuery)("<div></div>").attr( "id", "pinion_item_preview" ).appendTo( "#pinion_item_body" );
			(jQuery)("<div></div>").attr( "id", "pinion_item_settings" ).appendTo( "#pinion_item_body" );
				(jQuery)("<p></p>").addClass( "pinion_item_settings_title" ).appendTo( "#pinion_item_settings" ).text( translation.item_settings ).append( (jQuery)("<span></span>" ).text( translation.embedded_item_appearance ) );
				(jQuery)("<div></div>").text( 'SELECT THE SIZE' ).addClass( "pinion_size_widget_title" ).appendTo( "#pinion_item_settings" );
				(jQuery)("<div></div>").addClass( "pinion_item_settings_select" ).appendTo( "#pinion_item_settings" );
							
				(jQuery)("<select></select>").appendTo( ".pinion_item_settings_select" )
				.addClass( "pinion_size_widget" )
				.attr("id","pinion_item_settings_format")
				.attr( "name", "size_widget" )
				.append(
					(jQuery)("<option></option>")
					.attr( "value", "size_full" )
					.text( 'Full-size' )
				)							
				.append(
					(jQuery)("<option></option>")
					.attr( "value", "size_300_600" )
					.text( '300x600' )
				)

		}

		// Pinion popup error message
		function pinion_popup_message( popup_title, message_title, message_content ) {
			
			// Popup title
			(jQuery)("#pinion_search_for").empty().append(
				(jQuery)("<p></p>").append( popup_title )
			);

			// Popup content
			(jQuery)("#pinion_search_results").empty().append(
				(jQuery)("<div></div>").addClass( "pinion_error_message" ).append(
					(jQuery)("<div></div>").addClass( "pinion_notice" ).append(
						(jQuery)("<h3></h3>").append( message_title )
					).append(
						(jQuery)("<p></p>").append( message_content )
					)
				)
			);
		}



		// Pinion search results
		function pinion_search_results( layout, data, popup_title, popup_title_paging  ) {
			

			// Popup title
			(jQuery)("#pinion_search_for")
			.empty()
			.append(
				(jQuery)("<p></p>")
				.append( popup_title )
				.append( popup_title_paging )
			);

			// Popup content
			(jQuery)("#pinion_search_results").empty();
			(jQuery)("#pinion_search_results")[0].scrollTop = 0;

			(jQuery).each(data, function(key, val) {

				var orientation;
					
				(jQuery)("<div></div>")
				.addClass( "pinion_" + layout + "_view" )
				.appendTo( "#pinion_search_results" )
				.append(
					// thumbnail
					(jQuery)("<div></div>")
					.addClass( "pinion_present_item_thumb" )
					.append(
						(jQuery)("<div></div>").addClass( "pinion_present_item_thumb_bg" ))
					.append(
						(jQuery)("<img>",{ src:val.channel_image } ).addClass(orientation)
					)
				)
				.append(
					// desc
					(jQuery)("<div></div>")
					.addClass( "pinion_present_item_desc" )
					.append(
						(jQuery)("<div></div>")
						.addClass( "pinion_present_item_title" )
						.text( val.name )
					)
				)
				.append(
					// type
					(jQuery)("<div></div>")
					.addClass( "pinion_present_item_info" )
					.append(
						(jQuery)("<div></div>")
						.text( val.pinions + ' Pinions' )
						.addClass( "pinion_present_item_images_count" )
					)
					.append(
						(jQuery)("<div></div>")
						.text( '\u00a0' )
						.addClass( "pinion_present_item_user_pic" )
						.append(
						(jQuery)("<div></div>").addClass( "pinion_present_item_user_pic_cont" ).append(
							(jQuery)("<img>",{ src:val.profile.profile_pic } )
						))
						
					)
					.append(
						(jQuery)("<div></div>")
						.text( val.pinionators + ' Pinionators' )
						.addClass( "pinion_present_item_users_count" )
					)							
				)
				.append(
					// buttons
					(jQuery)("<div></div>")
					.addClass( "pinion_present_item_buttons" )
					.append(
						(jQuery)("<select></select>")
						.addClass( "pinion_size_widget" )
						.attr( "name", "size_widget" )
						.append(
							(jQuery)("<option></option>")
							.attr( "value", "size_full" )
							.text( 'Full-size' )
						)							
						.append(
							(jQuery)("<option></option>")
							.attr( "value", "size_300_600" )
							.text( '300x600' )
						)
					)
					.append(
						(jQuery)("<input>")
						.attr( "type", "button" )
						.attr( "class", "button button-primary" )
						.attr( "value", translation.embed )
						.click( function() {
							var pinion_size = jQuery(this).parent().find(".pinion_size_widget").val();
							return pinion_shortcode_embed( val.id, pinion_size )
						})
					)
				);
			});
		}

		// Pinion popup pagination
		function pinion_popup_pagination( total_pages, current_page, type ) {
			
			// Set current page
			current_page = ( isNaN( current_page ) ) ? parseInt( current_page ) : current_page ;
			current_page = ( current_page < 1 ) ? 1 : current_page ;

			// Set start page
			var start_page = current_page -2;
			if ( start_page <= 0 ) { start_page = 1;
			}

			// Set end_page
			var end_page = current_page + 2;
			if ( end_page >= total_pages ) { end_page = total_pages;
			}

			// Open pagination container
			(jQuery)("<div></div>")
			.addClass( "pinion_item_pagination" )
			.addClass( type )
			.attr( "data-function", type )
			.appendTo( "#pinion_search_results" );

			// Add prev page link
			if ( current_page == 1 ) {
				(jQuery)("<a></a>")
				.addClass( "pinion_prev disabled_pagination" )
				.appendTo( ".pinion_item_pagination" );
			} else {
				(jQuery)("<a></a>")
				.attr( "onclick", type + "(" + (current_page -1) + ")" )
				.addClass( "pinion_prev enabled_pagination" )
				.appendTo( ".pinion_item_pagination" );
			}

			// Add pages
			for (page = start_page; page <= end_page; ++page) {
				current_page_class = ( (page == current_page) ? " pinion_current" : "" );

				(jQuery)("<a></a>")
				.attr( "onclick", type + "(" + page + ")" )
				.addClass( "enabled_pagination" )
				.addClass( current_page_class )
				.appendTo( ".pinion_item_pagination" )
				.text( page );
			}

			// Add next page link
			if ( current_page == total_pages ) {
				(jQuery)("<a></a>")
				.addClass( "pinion_next disabled_pagination" )
				.appendTo( ".pinion_item_pagination" );
			} else {
				(jQuery)("<a></a>")
				.attr( "onclick", type + "(" + (current_page + 1) + ")" )
				.addClass( "pinion_next enabled_pagination" )
				.appendTo( ".pinion_item_pagination" );
			}

		}

		// Pinion show popup screen
		function pinion_show_screen() {

			var is_content_tab = ( ( (jQuery)("#pinion_popup_tab_content").hasClass( "pinion_active_tab" ) ) ? true : false ),
				is_search      = ( ( (jQuery)("#pinion_search").val().trim() != '' ) ? true : false );

			if ( is_search ) {
				if ( is_content_tab ) {
					pinion_general_search( 1 );
				} else {
					pinion_user_search( 1 );
				}
			} else {
				if ( is_content_tab ) {
					pinion_featured_items( 1 );
				} else {
					pinion_my_items( 1 );
				}
			}
		}

		// Pinion featured items screen
		function pinion_featured_items( current_page ) {
			
			(jQuery)(".pinion_search_fields").show();

			// Set variables
			var results_layout = "grid",
				results_title  = translation.featured_items;
				
			// Update tabs
			(jQuery)("#pinion_popup_tab_content").addClass( "pinion_active_tab" );
			(jQuery)("#pinion_popup_tab_myitems").removeClass( "pinion_active_tab" );

			var category = (jQuery)("#pinion_search_type").val();
			if (category == '') {
				var dataObject = {
					page : current_page
				};
			} else {
				var dataObject = {
					search : 'category:'+category
				};
			}
			

			
			// Load items using the Pinion API
			(jQuery).ajax({
				url      : apiBaseUrl,
				type     : "get",
				dataType : "json",
				beforeSend: function(xhr){xhr.setRequestHeader('X-Authorization', '5ae2a79301b752a69b3cd4b0242535f94109b53b');},
				data     : dataObject,
				error    : function( data ) {
					// Server Error
					pinion_popup_message( results_title, translation.server_error, translation.try_in_a_few_minutes );
					console.error( "Couldn't get data: ", data );
				},
				success  : function( data ) {

					// Set variables
					var total_items   = data.data.total,
						total_pages   = ( ( total_items >= data.data.per_page ) ? Math.ceil( total_items / data.data.per_page ) : 1 ),
						results_pages = ( ( current_page > 1 ) ? " <span class='pinion_search_title_pagination'>(" + translation.page + " " + current_page + " / " + total_pages + ")" : "" );
					
					// Data output
					if ( total_items > 0 ) {
						// Show Results
						results_pages = "";
						pinion_search_results( results_layout, data.data.data, results_title, results_pages );
						// Pagination
						if ( total_items > data.data.per_page ) {
							pinion_popup_pagination( total_pages, current_page, 'pinion_featured_items' );
						}
					} else {
						// No Search Results
						pinion_popup_message( results_title, translation.no_results_found, translation.try_different_search );
					}
				}
			});
		}

		window.pinion_featured_items = pinion_featured_items;

		// Pinion general search screen
		function pinion_general_search( current_page ) {
			
			var search_param = (jQuery)("#pinion_search").val();

			// Set variables
			var results_layout = "grid",

			string = (jQuery)("#pinion_search").val();
			if (string.length > 25) {
				string = string.substring( 0,16 ) + "...";
			}

			results_title  = ( translation.results_for + " '" + string + "'" );

			// Update tabs
			(jQuery)("#pinion_popup_tab_content").addClass( "pinion_active_tab" );
			(jQuery)("#pinion_popup_tab_myitems").removeClass( "pinion_active_tab" );

			var category = (jQuery)("#pinion_search_type").val();
			if (category == '') {
				var query = search_param;
			} else {
				var query = 'category:'+category+';'+search_param;
			}
			

			var dataObject = {
				search : query
			};
			// Load items using the Pinion API
			(jQuery).ajax({
				url      : apiBaseUrl,
				type     : "get",
				dataType : "json",
				data     : dataObject,
				error    : function( data ) {
					
					// Server Error
					pinion_popup_message( results_title, translation.server_error, translation.try_in_a_few_minutes );
					console.error( "Couldn't get data: ", data );

				},
				beforeSend: function(xhr){xhr.setRequestHeader('X-Authorization', '5ae2a79301b752a69b3cd4b0242535f94109b53b');},
				success  : function( data ) {


					// Set variables
					var total_items   = data.data.total,
						total_pages   = ( ( total_items >= data.data.per_page ) ? Math.ceil( total_items / data.data.per_page ) : 1 ),
						results_pages = ( ( current_page > 1 ) ? " <span class='pinion_search_title_pagination'>(" + translation.page + " " + current_page + " / " + total_pages + ")" : "" );
					
					// Data output
					if ( total_items > 0 ) {
						// Show Results
						results_pages = "";
						pinion_search_results( results_layout, data.data.data, results_title, results_pages );
						// Pagination
						if ( total_items > data.data.per_page ) {
							pinion_popup_pagination( total_pages, current_page, 'pinion_featured_items' );
						}
					} else {
						// No Search Results
						pinion_popup_message( results_title, translation.no_results_found, translation.try_different_search );
					}
				}
			});
		}

		window.pinion_general_search = pinion_general_search;

		// Pinion my items screen
		function pinion_my_items( current_page ) {

			(jQuery)(".pinion_search_fields").hide();

			// Update tabs
			(jQuery)("#pinion_popup_tab_content").removeClass( "pinion_active_tab" );
			(jQuery)("#pinion_popup_tab_myitems").addClass( "pinion_active_tab" );

			// Popup title
			(jQuery)("#pinion_search_for").empty();

			// Popup content
			(jQuery)("#pinion_search_results").empty();

		}
		window.pinion_my_items = pinion_my_items;

		// Pinion user search screen
		function pinion_channel_search( current_page ) {

			var user_id = (jQuery)("#pinion_search_user_id").val();
			var user_name = (jQuery)("#pinion_search_user_name").val();
			
			(jQuery)( "#pinion_search" ).autocomplete( "destroy" );

			var results_layout = "grid",
				results_title  = (  translation.results_for + " '" + user_name + "' " );
		
			var dataObject = {
				page: current_page,
				orderBy: "created_at",
				search: "user_id:"+user_id,
				searchFields: "user_id:=",
				sortedBy: "desc"
			};
			

			// Load items using the Pinion API
			(jQuery).ajax({
				url      : apiBaseUrl,
				type     : "get",
				dataType : "json",
				data     : dataObject,
				error    : function( data ) {
					
					// Server Error
					pinion_popup_message( results_title, translation.server_error, translation.try_in_a_few_minutes );
					console.error( "Couldn't get data: ", data );

				},
				beforeSend: function(xhr){xhr.setRequestHeader('X-Authorization', '5ae2a79301b752a69b3cd4b0242535f94109b53b');},
				success  : function( data ) {

					// Set variables
					var total_items  = data.data.total,
						total_pages  = ( ( total_items >= data.data.per_page ) ? Math.ceil( total_items / data.data.per_page ) : 1 ),
						results_pages = ( ( data.data.current_page > 1 ) ? " <span class='pinion_search_title_pagination'>(" + translation.page + " " + data.data.current_page + " / " + total_pages + ")" : "" );

					// Data output
					if ( data.data.data.length > 0 ) {
						// Show Results
						pinion_search_results( results_layout, data.data.data, results_title, results_pages );
						// Pagination
						if ( total_items > data.data.per_page ) {
							pinion_popup_pagination( total_pages, data.data.current_page, 'pinion_channel_search' );
						}
					} else {
						// No Search Results
						pinion_popup_message( results_title, translation.no_results_found, translation.try_different_search );
					} 
				}
			});			
		}		
		
		
		// Pinion user search screen
		function pinion_user_search( current_page ) {
		
			// // Update tabs
			(jQuery)("#pinion_popup_tab_content").removeClass( "pinion_active_tab" );
			(jQuery)("#pinion_popup_tab_myitems").addClass( "pinion_active_tab" );		
			
			(jQuery)( "#pinion_search" ).autocomplete({
				source: function( request, response ) {
				 
					var dataObject = {
						search	: request.term,
						limit	: 12,
						offset	: 0
					};
					
					(jQuery).ajax({
						url: 'https://api.pinionate.com/api/v1/search/pinionators',
						type     : "get",
						dataType: "json",
						data: dataObject,
						beforeSend: function(xhr){xhr.setRequestHeader('X-Authorization', '5ae2a79301b752a69b3cd4b0242535f94109b53b');},
						success: function( data ) {
							
							response((jQuery).map(data.data, function(item){
								return{
									label: item.first_name+' '+item.last_name,
									value: item.first_name+' '+item.last_name,
									user_id: item.user_id
								}
							}));
						}
					});
				},
				minLength: 2,
				select: function( event, ui ) {
					(jQuery)("#pinion_search_user_id").val( ui.item.user_id );
					(jQuery)("#pinion_search_user_name").val( ui.item.value );
					pinion_channel_search('1');
				}
			});
		}

		window.pinion_user_search = pinion_user_search;

		/**
		 *
		 *  TINYMCE PLUGIN
		 *
		 */

		// Add pinion search popup
		editor.addCommand( 'search_pinion_items', function( ui, v ) {

			// Open Pinion Popup
			pinion_popup();

			// Create popup structure (search popup)
			pinion_search_popup_structure();

			// Show featured items (on load)
			pinion_featured_items( 1 );

		});

		// Add pinion button to tinyMCE visual editor
		editor.addButton( 'pinion', {
			icon    : 'pinion',
			tooltip : 'Pinionate',
			onclick : function() {

				// Open search popup
				editor.execCommand( 'search_pinion_items' );
			}
		});

		// Replace the shortcode with an item info box
		editor.on( 'BeforeSetContent', function( event ) {
			
		event.content = event.content.replace( /\[pinion([^\]]*)\]/g, function( all, attr, con ) {

				// Encode all the shortcode attributes, to be stored in <div data-pinion-attr="...">

				// Extract itemId 
				var itemId 		  = get_attr(  attr , 'id' ),
					itemWidth       = get_attr(  attr , 'width' ),
					itemHeight       = get_attr(  attr, 'height' ),
					itemFormat		= get_attr(  attr , 'format' );
					
					if (itemFormat == 'size_full') {
						var itemWidth = '100%';
						var itemHeight = '100%';
						var container_width = 'width:96%;';
					} else if (itemFormat == 'size_300_600') {
						var itemWidth = '300px';
						var itemHeight = '600px';
						var container_width = 'width:46%;';
					}
					
				var encodedShortcodeAttributes = window.encodeURIComponent( attr );	

				// Set random image id
				var id = Math.round( Math.random() * 100000 );

				// Set width of main container and bottom background
				var width_conteiner = '100%';
				var pinion_bg_width = '120px';
				
				if(itemWidth == '300px'){
					width_conteiner = '46%';
					pinion_bg_width = '90px';
				}
				return '<div class="wp_pinion_container" style="position:relative;width:'+width_conteiner+';"><div class="wp_pinion_buttons" id="pinion_overlay_'+id+'" data-pinion-attr="'+encodedShortcodeAttributes+'"></div><div class="wp_pinion_bg" style="width:'+pinion_bg_width+';"></div><div class="wp_pinion_delete" id="pinion_overlay_close_'+id+'"></div><div class="wp_pinion_edit" data-pinion-attr="'+encodedShortcodeAttributes+'" id="pinion_overlay_edit_'+id+'"></div><iframe data-pinion-attr="'+encodedShortcodeAttributes+'" src="https://cdn.pinionate.com/widget.html?channel_id='+itemId+'" scrolling="no" width="'+itemWidth+'" height="600px" frameborder="0"></iframe></div>';
			
			});

		});

		// Replace the item info box with the shortcode
		editor.on( 'GetContent', function( event ) {
			
			event.content = event.content.replace( /((<div class="wp_pinion_container"[^<>]*>)(.*?)(?:<\/iframe><\/div>))*/g, function( match, tag ) {

				// Extract shortcode attributes from <div data-pinion-attr="...">
				var data = get_attr( tag, 'data-pinion-attr' );

				// Create the shortcode
				if ( data ) {
					return  '<p>[pinion' + decodeURIComponent( data ) + ']</p>'; 
				}

				return match;

			});

		});

		// Item edit popup
		editor.on( 'click', function(e) {
			
			// Delete item
			if ( ( e.target.nodeName == 'DIV' ) && ( e.target.className.indexOf( 'wp_pinion_delete' ) > -1 ) ) {
				var id = e.target.id;
				if (id !== "") {
					(jQuery)(tinyMCE.activeEditor.dom.doc.body).find( "#" + id ).parent().remove();
					(jQuery)(tinyMCE.activeEditor.dom.doc.body).append( '<p><br data-mce-bogus="1"></p>' );

					//Force cursor activation
					(jQuery)('#content-html').trigger( 'click' );
					setTimeout( "(jQuery)('#content-tmce').trigger('click')", 200 )
				} else {
					(jQuery)(tinyMCE.activeEditor.selection.getNode()).remove();
				}
				(jQuery)( '.pinion_popup_overlay_container' ).remove();
			}

			// Edit item
			if ( ( e.target.nodeName == 'DIV' ) && ( ( e.target.className.indexOf( 'wp_pinion_buttons' ) > -1 ) || ( e.target.className.indexOf( 'wp_pinion_edit' ) > -1 ) ) ) {

				// Extract shortcode attributes stored in <div data-pinion-attr="...">
				var attr = decodeURIComponent(e.target.attributes['data-pinion-attr'].value);
				
				// Set values
				var itemId            = get_attr( attr, 'id' ),
					width         = get_attr( attr, 'width' ),
					height        = get_attr( attr, 'height' )

				// Open Pinion Popup
				pinion_popup();

				// Create item popup structure
				pinion_item_popup_structure( width, height, itemId );

				// Item Preview
				(jQuery).ajax({
					url      : apiBaseUrl,
					type     : "get",
					dataType : "json",
					data     : {
						search: 'id:'+itemId
					},
					error    : function( data ) {

				// Clear preview
				(jQuery)("#pinion_item_preview").empty();
					console.error( "Couldn't get data: ", data );
					},
					beforeSend: function(xhr){xhr.setRequestHeader('X-Authorization', '5ae2a79301b752a69b3cd4b0242535f94109b53b');},
					success  : function( data ) {

				// Create preview
							(jQuery)("#pinion_item_preview").empty().append(
								(jQuery)("<table></table>").append(
									(jQuery)("<tbody></tbody>").append(
										(jQuery)("<tr></tr>").attr( "valign", "top" ).append(
											(jQuery)("<td></td>").addClass( "pinion_item_thumb" )
										).append(
											(jQuery)("<td></td>").addClass( "pinion_item_info" )
										)
									)
								)
							);

							// Add thumb
							(jQuery)("<p></p>").addClass( "pinion_item_thumb" ).appendTo( "td.pinion_item_thumb" );
							(jQuery)("<img>").attr( "src", data.data.data[0].channel_image ).appendTo( "p.pinion_item_thumb" );

							// Add info
							(jQuery)("<p></p>").addClass( "pinion_item_title" ).appendTo( "td.pinion_item_info" ).text( data.data.data[0].name );
							(jQuery)("<p></p>").addClass( "pinion_item_meta" ).appendTo( "td.pinion_item_info" ).text( translation.created_by + " " ).append(
							(jQuery)("<span></span>" ).text( data.data.data[0].profile.first_name + ' ' + data.data.data[0].profile.last_name + ' ' )
							).append( translation.on + " " + item_date( data.data.data[0].created_at ) );

					}
				});

				// Click Update button
				(jQuery)(".pinion_item_update_button").click(function( e ) {

					// start shortcode tag
					var shortcode_str = '[pinion';

					var new_item_id = (jQuery)("#pinion_item_settings_id");

					if ( typeof new_item_id != 'undefined' && new_item_id.length && new_item_id.val() != '') {
						shortcode_str += ' id="' + new_item_id.val() + '"';
					}

					var format = (jQuery)("#pinion_item_settings_format");

					if ( typeof format != 'undefined' && format.length && format.val() != '' ) {
						if (format.val() == 'size_full') {
							var itemWidth = '100%';
							var itemHeight = '100%';
						} else if (format.val() == 'size_300_600') {
							var itemWidth = '300px';
							var itemHeight = '600px';	
						}
						shortcode_str += ' width="' + itemWidth + '" height="' + itemHeight + '"';
					}

					// End shortcode tag
					shortcode_str += ']';

					// Insert shortcode to the editor
					var id = tinyMCE.activeEditor.selection.getNode().id;

					id !== "" && (jQuery)(tinyMCE.activeEditor.dom.doc.body).find( "#" + id ).parent().remove();
					tinyMCE.activeEditor.selection.setContent( shortcode_str );
					(jQuery)( '.pinion_popup_overlay_container' ).remove();
				});
			}
		});
	});
})();