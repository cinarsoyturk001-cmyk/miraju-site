CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorites_user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productImage` text,
	`unitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`total` int NOT NULL,
	`itemCount` int NOT NULL,
	`status` enum('Hazırlanıyor','Tamamlandı','İptal edildi') NOT NULL DEFAULT 'Hazırlanıyor',
	`invoiceType` enum('individual','corporate','einvoice') NOT NULL DEFAULT 'individual',
	`shippingAddress` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_publicId_unique` UNIQUE(`publicId`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`text` text NOT NULL,
	`status` enum('published','pending','rejected') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `reviews_product_status_idx` ON `reviews` (`productId`,`status`);