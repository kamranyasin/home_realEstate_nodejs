-- CreateTable
CREATE TABLE `blogs` (
    `blogid` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `images` JSON NULL,
    `views` BIGINT NULL,
    `slug` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blogs_slug_key`(`slug`),
    PRIMARY KEY (`blogid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
