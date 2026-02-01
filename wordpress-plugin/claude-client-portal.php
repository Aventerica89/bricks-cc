<?php
/**
 * Plugin Name: Claude Client Portal
 * Plugin URI: https://github.com/your-repo/claude-client-portal
 * Description: Integrates Claude AI chat widget for client communication
 * Version: 1.0.0
 * Author: WP Manager
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: claude-client-portal
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('CLAUDE_PORTAL_VERSION', '1.0.0');
define('CLAUDE_PORTAL_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CLAUDE_PORTAL_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class Claude_Client_Portal {

    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_footer', array($this, 'render_chat_widget'));
    }

    /**
     * Initialize plugin
     */
    public function init() {
        load_plugin_textdomain('claude-client-portal', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Claude Client Portal', 'claude-client-portal'),
            __('Claude Portal', 'claude-client-portal'),
            'manage_options',
            'claude-client-portal',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('claude_portal_settings', 'claude_portal_api_url');
        register_setting('claude_portal_settings', 'claude_portal_site_id');
        register_setting('claude_portal_settings', 'claude_portal_enabled');
        register_setting('claude_portal_settings', 'claude_portal_position');
        register_setting('claude_portal_settings', 'claude_portal_allowed_roles');
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Save settings message
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'claude_portal_messages',
                'claude_portal_message',
                __('Settings Saved', 'claude-client-portal'),
                'updated'
            );
        }

        settings_errors('claude_portal_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form action="options.php" method="post">
                <?php
                settings_fields('claude_portal_settings');
                ?>

                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="claude_portal_enabled"><?php _e('Enable Chat Widget', 'claude-client-portal'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" name="claude_portal_enabled" id="claude_portal_enabled" value="1" <?php checked(get_option('claude_portal_enabled'), '1'); ?>>
                            <p class="description"><?php _e('Enable or disable the chat widget on the frontend.', 'claude-client-portal'); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="claude_portal_api_url"><?php _e('API URL', 'claude-client-portal'); ?></label>
                        </th>
                        <td>
                            <input type="url" name="claude_portal_api_url" id="claude_portal_api_url" value="<?php echo esc_attr(get_option('claude_portal_api_url')); ?>" class="regular-text" placeholder="https://your-app.vercel.app">
                            <p class="description"><?php _e('The URL of your WP Manager + Claude AI application.', 'claude-client-portal'); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="claude_portal_site_id"><?php _e('Site ID', 'claude-client-portal'); ?></label>
                        </th>
                        <td>
                            <input type="text" name="claude_portal_site_id" id="claude_portal_site_id" value="<?php echo esc_attr(get_option('claude_portal_site_id')); ?>" class="regular-text">
                            <p class="description"><?php _e('Your unique site identifier from WP Manager.', 'claude-client-portal'); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="claude_portal_position"><?php _e('Widget Position', 'claude-client-portal'); ?></label>
                        </th>
                        <td>
                            <select name="claude_portal_position" id="claude_portal_position">
                                <option value="bottom-right" <?php selected(get_option('claude_portal_position', 'bottom-right'), 'bottom-right'); ?>><?php _e('Bottom Right', 'claude-client-portal'); ?></option>
                                <option value="bottom-left" <?php selected(get_option('claude_portal_position'), 'bottom-left'); ?>><?php _e('Bottom Left', 'claude-client-portal'); ?></option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label><?php _e('Allowed Roles', 'claude-client-portal'); ?></label>
                        </th>
                        <td>
                            <?php
                            $allowed_roles = get_option('claude_portal_allowed_roles', array('administrator'));
                            if (!is_array($allowed_roles)) {
                                $allowed_roles = array('administrator');
                            }

                            $roles = wp_roles()->get_names();
                            foreach ($roles as $role_key => $role_name) {
                                ?>
                                <label style="display: block; margin-bottom: 5px;">
                                    <input type="checkbox" name="claude_portal_allowed_roles[]" value="<?php echo esc_attr($role_key); ?>" <?php checked(in_array($role_key, $allowed_roles)); ?>>
                                    <?php echo esc_html($role_name); ?>
                                </label>
                                <?php
                            }
                            ?>
                            <p class="description"><?php _e('Select which user roles can see and use the chat widget.', 'claude-client-portal'); ?></p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(__('Save Settings', 'claude-client-portal')); ?>
            </form>

            <hr>

            <h2><?php _e('Connection Status', 'claude-client-portal'); ?></h2>
            <p>
                <?php
                $api_url = get_option('claude_portal_api_url');
                if ($api_url) {
                    echo '<span style="color: green;">&#x2713;</span> ' . __('API URL configured', 'claude-client-portal');
                } else {
                    echo '<span style="color: red;">&#x2717;</span> ' . __('API URL not configured', 'claude-client-portal');
                }
                ?>
            </p>
            <p>
                <?php
                $site_id = get_option('claude_portal_site_id');
                if ($site_id) {
                    echo '<span style="color: green;">&#x2713;</span> ' . __('Site ID configured', 'claude-client-portal');
                } else {
                    echo '<span style="color: red;">&#x2717;</span> ' . __('Site ID not configured', 'claude-client-portal');
                }
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * Check if current user can see the widget
     */
    private function can_user_see_widget() {
        if (!is_user_logged_in()) {
            return false;
        }

        $user = wp_get_current_user();
        $allowed_roles = get_option('claude_portal_allowed_roles', array('administrator'));

        if (!is_array($allowed_roles)) {
            $allowed_roles = array('administrator');
        }

        return array_intersect($allowed_roles, $user->roles) !== array();
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        if (!get_option('claude_portal_enabled')) {
            return;
        }

        if (!$this->can_user_see_widget()) {
            return;
        }

        // Enqueue styles
        wp_enqueue_style(
            'claude-portal-widget',
            CLAUDE_PORTAL_PLUGIN_URL . 'assets/css/widget.css',
            array(),
            CLAUDE_PORTAL_VERSION
        );

        // Enqueue scripts
        wp_enqueue_script(
            'claude-portal-widget',
            CLAUDE_PORTAL_PLUGIN_URL . 'assets/js/chat-widget.js',
            array(),
            CLAUDE_PORTAL_VERSION,
            true
        );

        // Pass configuration to JavaScript
        $user = wp_get_current_user();
        wp_localize_script('claude-portal-widget', 'claudePortalConfig', array(
            'apiUrl' => get_option('claude_portal_api_url'),
            'siteId' => get_option('claude_portal_site_id'),
            'clientId' => 'wp-user-' . $user->ID,
            'clientName' => $user->display_name,
            'clientEmail' => $user->user_email,
            'position' => get_option('claude_portal_position', 'bottom-right'),
            'currentPageId' => get_the_ID(),
            'nonce' => wp_create_nonce('claude_portal_nonce')
        ));
    }

    /**
     * Render chat widget container
     */
    public function render_chat_widget() {
        if (!get_option('claude_portal_enabled')) {
            return;
        }

        if (!$this->can_user_see_widget()) {
            return;
        }

        echo '<div id="claude-portal-widget-container"></div>';
    }
}

// Initialize plugin
Claude_Client_Portal::get_instance();

/**
 * Activation hook
 */
function claude_portal_activate() {
    // Set default options
    add_option('claude_portal_enabled', '0');
    add_option('claude_portal_position', 'bottom-right');
    add_option('claude_portal_allowed_roles', array('administrator'));
}
register_activation_hook(__FILE__, 'claude_portal_activate');

/**
 * Deactivation hook
 */
function claude_portal_deactivate() {
    // Cleanup if needed
}
register_deactivation_hook(__FILE__, 'claude_portal_deactivate');
