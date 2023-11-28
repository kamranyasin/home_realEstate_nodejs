-- CreateTable
CREATE TABLE `user` (
    `userid` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneno` INTEGER NULL,
    `dataOfBirth` DATETIME(3) NULL,
    `password` VARCHAR(255) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `media` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'agent',
    `confirmpw` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_phoneno_key`(`phoneno`),
    PRIMARY KEY (`userid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `propertiesid` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NULL,
    `property_type` VARCHAR(191) NULL,
    `property_status` VARCHAR(191) NULL,
    `property_price` INTEGER NULL,
    `max_rooms` INTEGER NULL,
    `beds` INTEGER NULL,
    `baths` INTEGER NULL,
    `area` VARCHAR(191) NULL,
    `price` INTEGER NULL,
    `agencies` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `land_mark` VARCHAR(191) NULL,
    `media` JSON NULL,
    `video_url` VARCHAR(191) NULL,
    `additional_features` JSON NULL,
    `views` BIGINT NULL,
    `slug` VARCHAR(191) NULL,
    `s_access` VARCHAR(191) NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `properties_slug_key`(`slug`),
    PRIMARY KEY (`propertiesid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `projectid` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NULL,
    `title` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `project_type` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `location_area` VARCHAR(191) NULL,
    `life_style` VARCHAR(191) NOT NULL,
    `map_pin` VARCHAR(191) NULL,
    `starting_price` INTEGER NULL,
    `images` JSON NULL,
    `yt_video` VARCHAR(191) NULL,
    `developer_name` VARCHAR(191) NULL,
    `first_installment` INTEGER NULL,
    `construction_status` INTEGER NULL,
    `handover_status` INTEGER NULL,
    `blue_prints` JSON NULL,
    `features` JSON NULL,
    `description` JSON NULL,
    `listing` JSON NULL,
    `slug` VARCHAR(191) NULL,

    UNIQUE INDEX `project_slug_key`(`slug`),
    PRIMARY KEY (`projectid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
