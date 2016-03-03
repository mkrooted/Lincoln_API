CREATE DATABASE  IF NOT EXISTS `lincoln_project` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `lincoln_project`;
-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: lincoln_project
-- ------------------------------------------------------
-- Server version	5.7.10-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actions`
--

DROP TABLE IF EXISTS `actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actions` (
  `action_id` int(11) NOT NULL AUTO_INCREMENT,
  `action_desc` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`action_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `coupon_id` char(40) NOT NULL COMMENT 'Unique ID of coupon',
  `coupon_owned` varchar(64) DEFAULT NULL COMMENT 'NULL if not owned, otherwise owner''s login',
  `coupon_paid` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'Boolean. Shows whether coupon is activated or not. If activated, coupon_price field should be filled',
  `coupon_price` decimal(5,2) DEFAULT NULL COMMENT 'Money equivalent of this coupon in UAH',
  `coupon_item` int(11) DEFAULT NULL COMMENT 'Item_id associated with this coupon',
  `coupon_children` json DEFAULT NULL COMMENT 'null if coupon is not activated. Stores IDs of child coupons in JSON array fomat',
  `coupon_date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Moment of coupon creation in DATETIME format',
  `coupon_date_paid` datetime DEFAULT NULL COMMENT 'Moment of coupon activation in DATETIME format',
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `sale_id_UNIQUE` (`coupon_id`),
  KEY `coupon_item_idx` (`coupon_item`),
  CONSTRAINT `coupon_item` FOREIGN KEY (`coupon_item`) REFERENCES `items` (`item_id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history_coupons`
--

DROP TABLE IF EXISTS `history_coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history_coupons` (
  `history_coupons_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Unique history record id',
  `history_coupons_user` varchar(64) DEFAULT NULL COMMENT 'Login of user that initiated this action or SYSTEM if no user',
  `history_coupons_coupon` char(40) DEFAULT NULL COMMENT 'Id of affected coupon',
  `history_coupons_action` int(11) DEFAULT NULL COMMENT 'Id of action according to table ''actions''',
  `history_coupons_datetime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Date and time of action in DATETIME format',
  PRIMARY KEY (`history_coupons_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Item''s unique ID',
  `item_name` varchar(64) DEFAULT NULL COMMENT 'Item''s name/title',
  `item_price` decimal(5,2) DEFAULT NULL COMMENT 'Item''s price in UAH',
  `item_in_stock` int(11) DEFAULT NULL COMMENT 'Number of this item available ofr sale',
  `item_available` tinyint(4) DEFAULT NULL COMMENT 'True or  false (1 or 0)',
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_login` varchar(64) NOT NULL COMMENT 'User''s unique login',
  `user_password` char(32) DEFAULT NULL COMMENT 'user''s password, hashed in specific hash-algorithm',
  `user_email` varchar(255) DEFAULT NULL COMMENT 'email of this user',
  `user_wmid` bigint(20) DEFAULT NULL COMMENT 'user''s wmid wallet id',
  `user_date_registered` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Shows moment of registration in DATETIME format',
  `user_date_last_login` datetime DEFAULT NULL COMMENT 'Shows moment of last login in DATETIME format',
  `user_last_ip` varchar(15) DEFAULT NULL COMMENT 'last known ip of this user',
  `user_hash` char(32) DEFAULT NULL COMMENT 'used for authentication purposes',
  `user_deleted` tinyint(4) DEFAULT '0' COMMENT 'Boolean. Shows whether this user is deleted or not',
  PRIMARY KEY (`user_login`),
  UNIQUE KEY `user_login_UNIQUE` (`user_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-03-03 19:18:40
