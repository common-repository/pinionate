<?php
/*
 * Security check
 * Exit if file accessed directly.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Pinion Scripts and Styles
 * Displays pinion menus in WordPress dashboard.
 *
 * @since 0.9.0
 */
class PinionScriptsStyles {

	private $pb_resource_version = '1.0.0';

	/*
	 * Constructor
	 */
	public function __construct() {

		// Load scripts and styles, in admin only
		if ( is_admin() ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'pinion_styles' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'pinion_scripts' ) );
		}

	}

	/*
	 * Pinion Styles
	 */
	public function pinion_styles() {

		$version = $this -> pb_resource_version;
 
		// Register Styles
		wp_register_style( 'pinion-admin',plugins_url( 'css/admin.css',__FILE__), false, $version );
		 
		// Enqueue Styles
		wp_enqueue_style( 'pinion-admin' );
	}

	/*
	 * Pinion Scripts
	 */
	public function pinion_scripts() {

		// Load settings
		$version = $this -> pb_resource_version;

		// Set localized translation strings for JS files
		$pinionate_js_translations = array(
			'pinion' => __( 'Pinionate', 'pinion' ),
			'pinion_content' => __( 'Pinionate Content', 'pinion' ),
			'my_items' => __( 'My Items', 'pinion' ),
			'create_your_own' => __( '+ Create Your Own', 'pinion' ),
			'search_term' => __( 'Search Term', 'pinion' ),
			'search_my_items' => __( 'Search my items', 'pinion' ),
			'results_for' => __( 'Results for', 'pinion' ),
			'no_results_found' => __( 'No results found', 'pinion' ),
			'try_different_search' => __( 'Please try again with a different search.', 'pinion' ),
			'change_user' => __( 'Change User', 'pinion' ),
			'server_error' => __( 'Server error', 'pinion' ),
			'try_in_a_few_minutes' => __( 'Please try again in a few minutes.', 'pinion' ),
			'no_user' => __( 'No user', 'pinion' ),
			'set_user' => __( 'Set User', 'pinion' ),
			'set_your_username' => __( 'Go to the <a href="options-general.php?page=pinion&tab=embed" target="_blank">Settings</a> and set your pinionate.com username.', 'pinion' ),
			'you_dont_have_any_items_yet' => __( 'You don\'t have any items (yet!).', 'pinion' ),
			'go_to_pinion_to_create_your_own_playful_content' => __( 'Go to <a href="https://www.pinionate.com/" target="_blank">pinionate.com</a> to create your own playful content and embed on your site.', 'pinion' ),
			'page' => __( 'page', 'pinion' ),
			'jan' => __( 'Jan', 'pinion' ),
			'feb' => __( 'Feb', 'pinion' ),
			'mar' => __( 'Mar', 'pinion' ),
			'apr' => __( 'Apr', 'pinion' ),
			'may' => __( 'May', 'pinion' ),
			'jun' => __( 'Jun', 'pinion' ),
			'jul' => __( 'Jul', 'pinion' ),
			'aug' => __( 'Aug', 'pinion' ),
			'sep' => __( 'Sep', 'pinion' ),
			'oct' => __( 'Oct', 'pinion' ),
			'nov' => __( 'Nov', 'pinion' ),
			'dec' => __( 'Dec', 'pinion' ),
			'show' => __( 'Show', 'pinion' ),
			'all_types' => __( 'All Types', 'pinion' ),
			'personality_quiz' => __( 'Personality Quiz', 'pinion' ),
			'story' => __( 'Story', 'pinion' ),
			'list' => __( 'List', 'pinion' ),
			'trivia' => __( 'Trivia', 'pinion' ),
			'poll' => __( 'Poll', 'pinion' ),
			'ranked_list' => __( 'Ranked List', 'pinion' ),
			'gallery_quiz' => __( 'Gallery Quiz', 'pinion' ),
			'flip_cards' => __( 'Flip Cards', 'pinion' ),
			'swiper' => __( 'Swiper', 'pinion' ),
			'video_snaps' => __( 'Video Snaps', 'pinion' ),
			'convo' => __( 'Convo', 'pinion' ),
			'countdown' => __( 'Countdown', 'pinion' ),
			'sort_by' => __( 'Sort By', 'pinion' ),
			'relevance' => __( 'Relevance', 'pinion' ),
			'views' => __( 'Views', 'pinion' ),
			'date' => __( 'Date', 'pinion' ),
			'discover_playful_content' => __( 'Discover Playful Content', 'pinion' ),
			'featured_items' => __( 'Featured Items', 'pinion' ),
			'created_by' => __( 'Created by', 'pinion' ),
			'by_user' => __( 'by', 'pinion' ),
			'by' => __( 'By', 'pinion' ),
			'on' => __( 'on', 'pinion' ),
			'items' => __( 'items', 'pinion' ),
			'view' => __( 'View', 'pinion' ),
			'embed' => __( 'Embed', 'pinion' ),
			'preview_item' => __( 'Preview item', 'pinion' ),
			'item_doesnt_exist' => __( 'Pinionate item does not exist', 'pinion' ),
			'check_shortcode_url' => __( 'Check shortcode URL in the text editor.', 'pinion' ),
			'your_item_will_be_embedded_here' => __( 'Your item will be embedded here', 'pinion' ),
			'pinion_item_settings' => __( 'Pinionate Item Settings', 'pinion' ),
			'item_settings' => __( 'Item Settings', 'pinion' ),
			'embedded_item_appearance' => __( 'Embedded Item Appearance', 'pinion' ),
			'use_site_default_settings' => __( 'Use site default settings', 'pinion' ),
			'configure_default_settings' => __( 'Configure default settings', 'pinion' ),
			'custom' => __( 'Custom', 'pinion' ),
			'display_item_information' => __( 'Display item information', 'pinion' ),
			'show_item_thumbnail_name_description_creator' => __( 'Show item thumbnail, name, description, creator.', 'pinion' ),
			'display_share_buttons' => __( 'Display share buttons', 'pinion' ),
			'show_share_buttons_with_links_to_your_site' => __( 'Show share buttons with links to YOUR site.', 'pinion' ),
			'display_more_recommendations' => __( 'Display more recommendations', 'pinion' ),
			'show_recommendations_for_more_items' => __( 'Show recommendations for more items.', 'pinion' ),
			'display_facebook_comments' => __( 'Display Facebook comments', 'pinion' ),
			'show_facebook_comments_in_your_items' => __( 'Show Facebook comments in your items.', 'pinion' ),
			'site_has_fixed_sticky_top_header' => __( 'Site has fixed (sticky) top header', 'pinion' ),
			'height' => __( 'Height', 'pinion' ),
			'px' => __( 'px', 'pinion' ),
			'use_this_if_your_website_has_top_header_thats_always_visible_even_while_scrolling_down' => __( 'Use this if your website has top header that\'s always visible, even while scrolling down.', 'pinion' ),
			'cancel' => __( 'Cancel', 'pinion' ),
			'update_item' => __( 'Update Item', 'pinion' ),
			'feedback_sent' => __( 'Feedback sent, thank you!', 'pinion' ),
			'feedback_error' => __( 'Something went wrong please try again...', 'pinion' ),
			'feedback_missing_required_fields' => __( 'Some required fields are missing.', 'pinion' ),
		);

		// Register Scripts
		wp_register_script( 'pinion-admin', plugins_url( 'js/pinion-admin.js', __FILE__ ), array( 'jquery' ), $version );

		// Register Localized Scripts
		wp_localize_script( 'pinion-admin', 'translation', $pinionate_js_translations );

		// Enqueue Scripts
		wp_enqueue_script( 'pinion-admin' );

	}


}
new PinionScriptsStyles();

?>