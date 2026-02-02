CREATE TABLE `agent_instructions` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`instruction_type` text NOT NULL,
	`content` text,
	`github_sync_path` text,
	`last_synced` integer,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`system_prompt` text,
	`config` text,
	`is_active` integer DEFAULT true,
	`version` integer DEFAULT 1,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `build_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text,
	`scenario_id` text,
	`phase` text DEFAULT 'javascript',
	`status` text DEFAULT 'in_progress',
	`input_data` text,
	`agent_outputs` text,
	`review_notes` text,
	`final_output` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `content_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source_url` text,
	`file_path` text,
	`metadata` text,
	`searchable_content` text,
	`indexed_at` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `lesson_scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`name` text NOT NULL,
	`acss_js_dump` text,
	`screenshot_before_url` text,
	`screenshot_after_url` text,
	`correct_container_grid_code` text,
	`css_handling_rules` text,
	`validation_rules` text,
	`expected_output` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`status` text DEFAULT 'draft',
	`order_index` integer DEFAULT 0,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `visual_comparisons` (
	`id` text PRIMARY KEY NOT NULL,
	`build_session_id` text NOT NULL,
	`comparison_type` text NOT NULL,
	`before_screenshot_url` text,
	`after_screenshot_url` text,
	`difference_map_url` text,
	`approval_status` text DEFAULT 'pending',
	`annotations` text,
	`created_at` integer DEFAULT (unixepoch())
);
