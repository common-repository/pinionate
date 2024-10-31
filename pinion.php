<?php
/*
Plugin Name: Pinionate
Plugin URI:  https://pinionate.com/
Description: Enhance your WordPress content with Pinionate's engaging storytelling tools and content.
Version:     1.0.0
Author:      Pinionate
*/

/*
 * Exit if file accessed directly
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Include plugin files
 */
include_once( plugin_dir_path( __FILE__ ) . 'class-pinion-scriptsstyles.php' ); // Load Scripts and Styles
include_once( plugin_dir_path( __FILE__ ) . 'pinion-shortcodes.php' );     // Add WordPress Shortcodes
include_once( plugin_dir_path( __FILE__ ) . 'class-pinion-tinymce.php' );        // Add TinyMCE plugin


?>