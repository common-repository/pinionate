<?php
/*
 * Security check
 * Exit if file accessed directly.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @param $posts
 * @return mixed
 */
function load_pinionate_head( $posts ) {
	
	if ( empty( $posts ) || is_admin() ) {
		return $posts;
	}

	$found = false;

	foreach ( $posts as $post ) {
		if ( has_shortcode( $post->post_content, 'pinion' ) ) {
			$found = true;
			break;
		}
	}

	if ( $found ) {
		wp_enqueue_script( 'external-pinion-js', 'https://cdn.pinionate.com/pinion.js' , '', '', false );
	}

	return $posts;
}

if ( !is_admin() ) {
	add_action( 'the_posts', 'load_pinionate_head' );
}

add_shortcode( 'pinion', 'pinion_item_shortcode' );

/*
 * Shortcode functions
 *
 * @since 0.1.1
 */
function pinion_item_shortcode( $atts ) {
	
	$code = '<div data-pinion-id="'. $atts['id']. '" data-pinion-height="'.$atts['height'].'" data-pinion-width="'.$atts['width'].'" style="height:600px;"></div>';

	// Theme Visibility
	return $code;

}

?>