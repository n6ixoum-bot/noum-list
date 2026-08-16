CREATE TABLE `noum_sync_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`payload` text NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `noum_sync_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `noum_sync_snapshots_user_id_unique` UNIQUE(`userId`)
);
