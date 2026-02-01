CREATE TABLE `basecamp_sync` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`basecamp_account_id` integer NOT NULL,
	`basecamp_project_id` integer NOT NULL,
	`sync_status` text DEFAULT 'active',
	`last_sync` integer,
	`api_token` text
);
--> statement-breakpoint
CREATE TABLE `bricks_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`page_id` integer,
	`page_title` text,
	`structure` text,
	`last_fetch` integer,
	`editable_by_client` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`site_id` text NOT NULL,
	`user_message` text NOT NULL,
	`claude_response` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `client_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`site_id` text NOT NULL,
	`feedback_type` text,
	`message` text NOT NULL,
	`attachments` text,
	`basecamp_todo_id` text,
	`status` text DEFAULT 'pending',
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `client_sites` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`wordpress_api_url` text,
	`bricks_api_key` text,
	`basecamp_project_id` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text,
	`avatar_url` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);