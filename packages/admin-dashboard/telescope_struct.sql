SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for api_aliveip
-- ----------------------------
DROP TABLE IF EXISTS `api_aliveip`;
CREATE TABLE `api_aliveip`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `log_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for auth_group
-- ----------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for auth_group_permissions
-- ----------------------------
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `auth_group_permissions_group_id_permission_id_0cd325b0_uniq`(`group_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for auth_permission
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `auth_permission_content_type_id_codename_01ab375a_uniq`(`content_type_id` ASC, `codename` ASC) USING BTREE,
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 300 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for authtoken_token
-- ----------------------------
DROP TABLE IF EXISTS `authtoken_token`;
CREATE TABLE `authtoken_token`  (
  `key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for django_admin_log
-- ----------------------------
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_type_id` int NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `django_admin_log_content_type_id_c4bce8eb_fk_django_co`(`content_type_id` ASC) USING BTREE,
  INDEX `django_admin_log_user_id_c564eba6_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for django_celery_results_taskresult
-- ----------------------------
DROP TABLE IF EXISTS `django_celery_results_taskresult`;
CREATE TABLE `django_celery_results_taskresult`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content_encoding` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `date_done` datetime(6) NOT NULL,
  `traceback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `task_args` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `task_kwargs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `task_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `worker` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `date_created` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `task_id`(`task_id` ASC) USING BTREE,
  INDEX `django_celery_results_taskresult_date_done_49edada6`(`date_done` ASC) USING BTREE,
  INDEX `django_celery_results_taskresult_status_cbbed23a`(`status` ASC) USING BTREE,
  INDEX `django_celery_results_taskresult_task_name_90987df3`(`task_name` ASC) USING BTREE,
  INDEX `django_celery_results_taskresult_worker_f8711389`(`worker` ASC) USING BTREE,
  INDEX `django_celery_results_taskresult_date_created_099f3424`(`date_created` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for django_content_type
-- ----------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `django_content_type_app_label_model_76bd3d3b_uniq`(`app_label` ASC, `model` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 79 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for django_migrations
-- ----------------------------
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for django_session
-- ----------------------------
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session`  (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`) USING BTREE,
  INDEX `django_session_expire_date_a5c62663`(`expire_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleorder
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleorder`;
CREATE TABLE `googleplay_googleorder`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `orderStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `orderTime` datetime(6) NOT NULL,
  `googdId` int NOT NULL,
  `goodsName` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `goodsPrice` double NOT NULL,
  `goodsFlow` int NOT NULL,
  `goodsDay` int NOT NULL,
  `vip` int NOT NULL,
  `purchaseToken` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `app` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `payAmout` double NULL DEFAULT NULL,
  `feeRate` double NOT NULL,
  `notifyTime` datetime(6) NULL DEFAULT NULL,
  `payTime` datetime(6) NULL DEFAULT NULL,
  `notifyStatus` int NULL DEFAULT NULL,
  `tradeNo` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  `orderType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isTrial` tinyint(1) NOT NULL,
  `trialDays` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `orderNo`(`orderNo` ASC) USING BTREE,
  INDEX `googleplay_googleorder_user_id_651a5d31_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `googleplay_googleorder_user_id_651a5d31_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleplayapplist
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleplayapplist`;
CREATE TABLE `googleplay_googleplayapplist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `createTime` datetime(6) NULL DEFAULT NULL,
  `app_key_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `googleplay_googlepla_app_key_id_2f68ae40_fk_googlepla`(`app_key_id` ASC) USING BTREE,
  CONSTRAINT `googleplay_googlepla_app_key_id_2f68ae40_fk_googlepla` FOREIGN KEY (`app_key_id`) REFERENCES `googleplay_googleplaykeyconfig` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleplayappversion
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleplayappversion`;
CREATE TABLE `googleplay_googleplayappversion`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `latestVersion` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `intVersion` int NOT NULL,
  `track` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `downloadUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `isSync` tinyint(1) NOT NULL,
  `createTime` datetime(6) NOT NULL,
  `appList_id` int NULL DEFAULT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `sha256` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `syncTrack` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `versionCode` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `googleplay_googlepla_appList_id_9eba37f2_fk_googlepla`(`appList_id` ASC) USING BTREE,
  CONSTRAINT `googleplay_googlepla_appList_id_9eba37f2_fk_googlepla` FOREIGN KEY (`appList_id`) REFERENCES `googleplay_googleplayapplist` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleplaybasecount
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleplaybasecount`;
CREATE TABLE `googleplay_googleplaybasecount`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_date` date NOT NULL,
  `web_view` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleplaykeyconfig
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleplaykeyconfig`;
CREATE TABLE `googleplay_googleplaykeyconfig`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `keyJson` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `createTime` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for googleplay_googleplaysubscript
-- ----------------------------
DROP TABLE IF EXISTS `googleplay_googleplaysubscript`;
CREATE TABLE `googleplay_googleplaysubscript`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` double NOT NULL,
  `flowSize` int NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `effective_time` int NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `sort` int NOT NULL,
  `vip` int NOT NULL,
  `appList_id` int NULL DEFAULT NULL,
  `currency` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isSync` tinyint(1) NOT NULL,
  `purchaseType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sku` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `subscriptPeriod` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `enableTrial` tinyint(1) NOT NULL,
  `gracePeriod` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `trialPeriod` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `googleplay_googlepla_appList_id_66247b45_fk_googlepla`(`appList_id` ASC) USING BTREE,
  CONSTRAINT `googleplay_googlepla_appList_id_66247b45_fk_googlepla` FOREIGN KEY (`appList_id`) REFERENCES `googleplay_googleplayapplist` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for jet_bookmark
-- ----------------------------
DROP TABLE IF EXISTS `jet_bookmark`;
CREATE TABLE `jet_bookmark`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user` int UNSIGNED NOT NULL,
  `date_add` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for jet_pinnedapplication
-- ----------------------------
DROP TABLE IF EXISTS `jet_pinnedapplication`;
CREATE TABLE `jet_pinnedapplication`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user` int UNSIGNED NOT NULL,
  `date_add` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for lock_keys
-- ----------------------------
DROP TABLE IF EXISTS `lock_keys`;
CREATE TABLE `lock_keys`  (
  `key_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_token` varchar(44) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_expiration` int UNSIGNED NOT NULL,
  PRIMARY KEY (`key_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for openwrt_openwrtuser
-- ----------------------------
DROP TABLE IF EXISTS `openwrt_openwrtuser`;
CREATE TABLE `openwrt_openwrtuser`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_time` datetime(6) NULL DEFAULT NULL,
  `shell_version` int NOT NULL,
  `is_test_user` tinyint(1) NOT NULL,
  `last_online_date` datetime(6) NULL DEFAULT NULL,
  `ha_cur_type` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_true_global` tinyint(1) NOT NULL,
  `isActived` tinyint(1) NOT NULL,
  `user_id` int NOT NULL,
  `is_online` tinyint(1) NOT NULL,
  `last_ip_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `mac_addr` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `dev_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `app_version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `openwrt_openwrtuser_user_id_4262c60d`(`user_id` ASC) USING BTREE,
  CONSTRAINT `openwrt_openwrtuser_user_id_4262c60d_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ss_node_info_log
-- ----------------------------
DROP TABLE IF EXISTS `ss_node_info_log`;
CREATE TABLE `ss_node_info_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `uptime` double NOT NULL,
  `load` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `log_time` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for ss_node_online_log
-- ----------------------------
DROP TABLE IF EXISTS `ss_node_online_log`;
CREATE TABLE `ss_node_online_log`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `node_id` int NOT NULL,
  `online_user` int NOT NULL,
  `log_time` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_actionlog
-- ----------------------------
DROP TABLE IF EXISTS `starhome_actionlog`;
CREATE TABLE `starhome_actionlog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL,
  `action` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `state` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `user_id` int NULL DEFAULT NULL,
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_actionlog_user_id_1d650492_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `starhome_actionlog_user_id_1d650492_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 543155 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_appversionrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_appversionrecord`;
CREATE TABLE `starhome_appversionrecord`  (
  `backupUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `latestVersion` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `intVersion` int NOT NULL,
  `platform` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ios_link` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `downloadUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `createTime` datetime(6) NOT NULL,
  `alioss` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `channel_id` int NULL DEFAULT NULL,
  `ios_test_link` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `upAliOss` tinyint(1) NOT NULL,
  `md5` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_appversionr_channel_id_32e0b12c_fk_starhome_`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `starhome_appversionr_channel_id_32e0b12c_fk_starhome_` FOREIGN KEY (`channel_id`) REFERENCES `starhome_channel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 592 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_card_info
-- ----------------------------
DROP TABLE IF EXISTS `starhome_card_info`;
CREATE TABLE `starhome_card_info`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `card_number` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `card_password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `card_status` int NOT NULL,
  `create_time` datetime(6) NULL DEFAULT NULL,
  `active_time` datetime(6) NULL DEFAULT NULL,
  `card_type_id` int NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_card_info_user_id_1403e6b0_fk_user_user_id`(`user_id` ASC) USING BTREE,
  INDEX `starhome_card_info_card_type_id_814b602f_fk_starhome_`(`card_type_id` ASC) USING BTREE,
  CONSTRAINT `starhome_card_info_card_type_id_814b602f_fk_starhome_` FOREIGN KEY (`card_type_id`) REFERENCES `starhome_card_package` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `starhome_card_info_user_id_1403e6b0_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5276 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_card_package
-- ----------------------------
DROP TABLE IF EXISTS `starhome_card_package`;
CREATE TABLE `starhome_card_package`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `flowSize` int NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `effective_time` int NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `vip` int NOT NULL,
  `repeat` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_channel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_channel`;
CREATE TABLE `starhome_channel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `sign` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `homeUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `logoSrc` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `brand` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `serverEmail` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `helpUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `about` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_time` datetime(6) NOT NULL,
  `modify_time` datetime(6) NOT NULL,
  `tgUsername` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_config
-- ----------------------------
DROP TABLE IF EXISTS `starhome_config`;
CREATE TABLE `starhome_config`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `web_site` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `web_copy_right` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `host` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isRegiest` tinyint(1) NOT NULL,
  `regiestWay` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `debugEmailReciver` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `inviteAddFlow` int NOT NULL,
  `inviteAddTime` int NOT NULL,
  `cardMoreUrl` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `payShow` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `trialAddFlow` int NOT NULL,
  `trialAddTime` int NOT NULL,
  `apiHost` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `useInChina` tinyint(1) NOT NULL,
  `dockerCMD` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `userLimitRate` int NOT NULL,
  `flowResetType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userExpireAction` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userOverFlowAction` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userOverFlowLimitRate` int NOT NULL,
  `ios_card_number` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ios_card_password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `multiLogin` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ipGetWay` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `node_img_url` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `telegram_bot_token` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tg_chat_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ali_oss_bucket` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ali_oss_endpoint` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ali_oss_keyId` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ali_oss_secret` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `autoLinitRate` int NOT NULL,
  `payRequestLimit` int NOT NULL,
  `iosAutoActive` tinyint(1) NOT NULL,
  `shareAction` tinyint(1) NOT NULL,
  `iosExamine` tinyint(1) NOT NULL,
  `iosExamineVersion` int NOT NULL,
  `iosAppId` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `iosAppIdPasswd` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_currency
-- ----------------------------
DROP TABLE IF EXISTS `starhome_currency`;
CREATE TABLE `starhome_currency`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `flags` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `rateToCny` double NULL DEFAULT NULL,
  `rateUpdateDate` datetime(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_datatransferrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_datatransferrecord`;
CREATE TABLE `starhome_datatransferrecord`  (
  `create_time` datetime(6) NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `old_user_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `old_user_flow` bigint NOT NULL,
  `old_user_expired_date` datetime(6) NULL DEFAULT NULL,
  `old_trial_imei` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `new_user_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `new_user_flow` bigint NOT NULL,
  `new_user_expired_date` datetime(6) NULL DEFAULT NULL,
  `new_trial_imei` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `use_flow` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `use_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `actioner` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 831 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_domainmanagemodel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_domainmanagemodel`;
CREATE TABLE `starhome_domainmanagemodel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `server` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cf_zone_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `iam_key_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_domainmanagemodel_name_6175de91`(`name` ASC) USING BTREE,
  INDEX `starhome_domainmanag_iam_key_id_dae91c00_fk_starhome_`(`iam_key_id` ASC) USING BTREE,
  CONSTRAINT `starhome_domainmanag_iam_key_id_dae91c00_fk_starhome_` FOREIGN KEY (`iam_key_id`) REFERENCES `starhome_iamkeymodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_domains
-- ----------------------------
DROP TABLE IF EXISTS `starhome_domains`;
CREATE TABLE `starhome_domains`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `isCNDomain` tinyint(1) NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `modify_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_downloadcount
-- ----------------------------
DROP TABLE IF EXISTS `starhome_downloadcount`;
CREATE TABLE `starhome_downloadcount`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_date` date NOT NULL,
  `down_num` int NOT NULL,
  `down_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `channel_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_downloadcou_channel_id_36b42b15_fk_starhome_`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `starhome_downloadcou_channel_id_36b42b15_fk_starhome_` FOREIGN KEY (`channel_id`) REFERENCES `starhome_channel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9853 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_emailconfig
-- ----------------------------
DROP TABLE IF EXISTS `starhome_emailconfig`;
CREATE TABLE `starhome_emailconfig`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `send_way` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nickname` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cryption` int NOT NULL,
  `hostname` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `port` int NULL DEFAULT NULL,
  `create_time` datetime(6) NULL DEFAULT NULL,
  `isEnable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_emailsendrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_emailsendrecord`;
CREATE TABLE `starhome_emailsendrecord`  (
  `create_time` datetime(6) NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `sendTo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `result` tinyint(1) NOT NULL,
  `contents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `sendCount_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_emailsendre_sendCount_id_4255e0f7_fk_starhome_`(`sendCount_id` ASC) USING BTREE,
  CONSTRAINT `starhome_emailsendre_sendCount_id_4255e0f7_fk_starhome_` FOREIGN KEY (`sendCount_id`) REFERENCES `starhome_emailconfig` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 203959 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_flagsurl
-- ----------------------------
DROP TABLE IF EXISTS `starhome_flagsurl`;
CREATE TABLE `starhome_flagsurl`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `flags` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `downUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_flags`(`flags` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 68 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_gfwaclfile
-- ----------------------------
DROP TABLE IF EXISTS `starhome_gfwaclfile`;
CREATE TABLE `starhome_gfwaclfile`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` int NOT NULL,
  `create_time` datetime(6) NOT NULL,
  `platform` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `file_local` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 159 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_gfwacllist
-- ----------------------------
DROP TABLE IF EXISTS `starhome_gfwacllist`;
CREATE TABLE `starhome_gfwacllist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `style` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `domain_name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `remark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `create_time` datetime(6) NOT NULL,
  `update_time` datetime(6) NOT NULL,
  `is_artificial` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `domain_name`(`domain_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22726 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_gfwacllist_copy2
-- ----------------------------
DROP TABLE IF EXISTS `starhome_gfwacllist_copy2`;
CREATE TABLE `starhome_gfwacllist_copy2`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `style` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `domain_name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `remark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `create_time` datetime(6) NOT NULL,
  `update_time` datetime(6) NOT NULL,
  `is_artificial` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `domain_name`(`domain_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 22695 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_helparticle
-- ----------------------------
DROP TABLE IF EXISTS `starhome_helparticle`;
CREATE TABLE `starhome_helparticle`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `create_time` datetime(6) NOT NULL,
  `modify_time` datetime(6) NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_homebasecount
-- ----------------------------
DROP TABLE IF EXISTS `starhome_homebasecount`;
CREATE TABLE `starhome_homebasecount`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_date` date NOT NULL,
  `web_view` int NOT NULL,
  `channel_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_homebasecou_channel_id_a0f8ae2f_fk_starhome_`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `starhome_homebasecou_channel_id_a0f8ae2f_fk_starhome_` FOREIGN KEY (`channel_id`) REFERENCES `starhome_channel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13793 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_iamkeymodel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_iamkeymodel`;
CREATE TABLE `starhome_iamkeymodel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `privacy_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `public_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `isEnable` tinyint(1) NOT NULL,
  `note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `platform` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_iosshowall
-- ----------------------------
DROP TABLE IF EXISTS `starhome_iosshowall`;
CREATE TABLE `starhome_iosshowall`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_version` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_msgrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_msgrecord`;
CREATE TABLE `starhome_msgrecord`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `msgLink` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `createdTime` datetime(6) NOT NULL,
  `modifyTime` datetime(6) NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `msgType` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `contents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 65 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_nodeonlineuserrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_nodeonlineuserrecord`;
CREATE TABLE `starhome_nodeonlineuserrecord`  (
  `created_time` datetime(6) NULL DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id_list` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_online_num` int NOT NULL,
  `user_total_num` int NOT NULL,
  `node_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_nodeonlineuserrecord_node_id_25095670_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `starhome_nodeonlineuserrecord_node_id_25095670_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 57883803 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_ordercount
-- ----------------------------
DROP TABLE IF EXISTS `starhome_ordercount`;
CREATE TABLE `starhome_ordercount`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_date` date NULL DEFAULT NULL,
  `purched_order` int NOT NULL,
  `purched_order_amount_rmb` double NOT NULL,
  `purched_order_amount_usd` double NOT NULL,
  `renew_order` int NOT NULL,
  `renew_order_amount_rmb` double NOT NULL,
  `renew_order_amount_usd` double NOT NULL,
  `channel_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_ordercount_channel_id_9544a821_fk_starhome_channel_id`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `starhome_ordercount_channel_id_9544a821_fk_starhome_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `starhome_channel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16413 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_orderrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_orderrecord`;
CREATE TABLE `starhome_orderrecord`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNo` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `goodsId` int NOT NULL,
  `goodsName` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `orderStatus` int NOT NULL,
  `orderBuyFlow` int NOT NULL,
  `orderBuyDate` int NOT NULL,
  `vip` int NOT NULL,
  `quantity` int NOT NULL,
  `orderTime` datetime(6) NOT NULL,
  `orderTotal` double NOT NULL,
  `payChannel` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `payChannelId` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `orderSubmitContent` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `notifyTime` datetime(6) NULL DEFAULT NULL,
  `alipayStatus` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `buyerId` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `tradeNo` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `payTime` datetime(6) NULL DEFAULT NULL,
  `buyerLogonId` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `buyerPayAmount` double NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `orderTotalCurrency` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `orderType` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `payCurrency_id` int NULL DEFAULT NULL,
  `payCurrencyAmount` double NULL DEFAULT NULL,
  `payCurrencyFee` double NULL DEFAULT NULL,
  `pay_method` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `goodsType` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `remark` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `orderNo`(`orderNo` ASC) USING BTREE,
  INDEX `starhome_orderrecord_payCurrency_id_e530fb9d`(`payCurrency_id` ASC) USING BTREE,
  INDEX `starhome_orderrecord_user_id_edd363d0_fk_user_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_pay_time`(`payTime` ASC) USING BTREE,
  CONSTRAINT `starhome_orderrecord_payCurrency_id_e530fb9d_fk_starhome_` FOREIGN KEY (`payCurrency_id`) REFERENCES `starhome_currency` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `starhome_orderrecord_user_id_edd363d0_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 519764 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_package
-- ----------------------------
DROP TABLE IF EXISTS `starhome_package`;
CREATE TABLE `starhome_package`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` double NOT NULL,
  `showPrice` double NOT NULL,
  `flowSize` int NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `effective_time` int NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `isTop` tinyint(1) NOT NULL,
  `isHot` tinyint(1) NOT NULL,
  `sort` int NOT NULL,
  `vip` int NOT NULL,
  `currency_id` int NULL DEFAULT NULL,
  `type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `production_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_package_currency_id_d510109a_fk_starhome_currency_id`(`currency_id` ASC) USING BTREE,
  CONSTRAINT `starhome_package_currency_id_d510109a_fk_starhome_currency_id` FOREIGN KEY (`currency_id`) REFERENCES `starhome_currency` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_paychannel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_paychannel`;
CREATE TABLE `starhome_paychannel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `channel` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `secure_key` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `APPID` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `GATEWAY` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `UUID` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `feeRate` double NULL DEFAULT NULL,
  `APP_PRIVATE_KEY` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `APP_PUBLIC_KEY` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `ALIPAY_PUBLIC_KEY` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `backUrl` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `public_ip` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `currency_id` int NULL DEFAULT NULL,
  `preferred` double NULL DEFAULT NULL,
  `checkout_usdt_id` int NULL DEFAULT NULL,
  `pay_way` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_paychannel_currency_id_c5c021c3_fk_starhome_currency_id`(`currency_id` ASC) USING BTREE,
  INDEX `starhome_paychannel_checkout_usdt_id_31b9cdae_fk_starhome_`(`checkout_usdt_id` ASC) USING BTREE,
  CONSTRAINT `starhome_paychannel_checkout_usdt_id_31b9cdae_fk_starhome_` FOREIGN KEY (`checkout_usdt_id`) REFERENCES `starhome_usdtwallet` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `starhome_paychannel_currency_id_c5c021c3_fk_starhome_currency_id` FOREIGN KEY (`currency_id`) REFERENCES `starhome_currency` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_sshkeymodel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_sshkeymodel`;
CREATE TABLE `starhome_sshkeymodel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `privacy_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `public_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isEnable` tinyint(1) NOT NULL,
  `note` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_subdomainmodel
-- ----------------------------
DROP TABLE IF EXISTS `starhome_subdomainmodel`;
CREATE TABLE `starhome_subdomainmodel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `record` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `record_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `record_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ttl` int NOT NULL,
  `proxy` tinyint(1) NOT NULL,
  `domain_id` int NULL DEFAULT NULL,
  `sync` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_subdomainmodel_record_b088de6f`(`record` ASC) USING BTREE,
  INDEX `starhome_subdomainmo_domain_id_498c8395_fk_starhome_`(`domain_id` ASC) USING BTREE,
  CONSTRAINT `starhome_subdomainmo_domain_id_498c8395_fk_starhome_` FOREIGN KEY (`domain_id`) REFERENCES `starhome_domainmanagemodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 620 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_uploadfiles
-- ----------------------------
DROP TABLE IF EXISTS `starhome_uploadfiles`;
CREATE TABLE `starhome_uploadfiles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `file` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `create_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_usdttransferrecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_usdttransferrecord`;
CREATE TABLE `starhome_usdttransferrecord`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `blockTime` datetime(6) NULL DEFAULT NULL,
  `trade_id` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `trx_fee` double NOT NULL,
  `energy_fee` bigint NOT NULL,
  `result` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `resultMsg` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `wallet_id` int NOT NULL,
  `transfer_num` double NOT NULL,
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `way` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_usdttransfe_wallet_id_33cdee05_fk_starhome_`(`wallet_id` ASC) USING BTREE,
  CONSTRAINT `starhome_usdttransfe_wallet_id_33cdee05_fk_starhome_` FOREIGN KEY (`wallet_id`) REFERENCES `starhome_usdtwallet` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 183318 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_usdtwallet
-- ----------------------------
DROP TABLE IF EXISTS `starhome_usdtwallet`;
CREATE TABLE `starhome_usdtwallet`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `balance` double NOT NULL,
  `private_key` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `public_key` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `hex` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `usdt` double NOT NULL,
  `password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_usercount
-- ----------------------------
DROP TABLE IF EXISTS `starhome_usercount`;
CREATE TABLE `starhome_usercount`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_date` date NULL DEFAULT NULL,
  `new_user_count` int NOT NULL,
  `ios_user` int NOT NULL,
  `android_user` int NOT NULL,
  `mac_user` int NOT NULL,
  `windows_user` int NOT NULL,
  `channel_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `starhome_usercount_channel_id_ba51472c_fk_starhome_channel_id`(`channel_id` ASC) USING BTREE,
  CONSTRAINT `starhome_usercount_channel_id_ba51472c_fk_starhome_channel_id` FOREIGN KEY (`channel_id`) REFERENCES `starhome_channel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15957 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for starhome_useronlinerecord
-- ----------------------------
DROP TABLE IF EXISTS `starhome_useronlinerecord`;
CREATE TABLE `starhome_useronlinerecord`  (
  `created_time` datetime(6) NULL DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `user_online_num` int NOT NULL,
  `user_total_num` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 431153 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_deletedusers
-- ----------------------------
DROP TABLE IF EXISTS `user_deletedusers`;
CREATE TABLE `user_deletedusers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `mac` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `macMd5` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `dateJoin` datetime(6) NOT NULL,
  `deletedTime` datetime(6) NOT NULL,
  `user_type` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_deletenodeinstancetask
-- ----------------------------
DROP TABLE IF EXISTS `user_deletenodeinstancetask`;
CREATE TABLE `user_deletenodeinstancetask`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nodeId` int NOT NULL,
  `instanceName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `region` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `platform` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` int NOT NULL,
  `create_time` datetime(6) NOT NULL,
  `exec_time` datetime(6) NULL DEFAULT NULL,
  `iamkey_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_deletenodeinsta_iamkey_id_b6004964_fk_starhome_`(`iamkey_id` ASC) USING BTREE,
  CONSTRAINT `user_deletenodeinsta_iamkey_id_b6004964_fk_starhome_` FOREIGN KEY (`iamkey_id`) REFERENCES `starhome_iamkeymodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 354 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_haportlist
-- ----------------------------
DROP TABLE IF EXISTS `user_haportlist`;
CREATE TABLE `user_haportlist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `ha_port` int NOT NULL,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `balance` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `node_id` int NOT NULL,
  `hidden` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_haportlist_node_id_aa855806_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `user_haportlist_node_id_aa855806_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1275 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_invitelog
-- ----------------------------
DROP TABLE IF EXISTS `user_invitelog`;
CREATE TABLE `user_invitelog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL,
  `inviter_id` int NOT NULL,
  `invite_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `channel` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `platform` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `get_time` int NOT NULL,
  `get_flow` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_invitelog_user_id_b558c554_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_invitelog_user_id_b558c554_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14948 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_loginlog
-- ----------------------------
DROP TABLE IF EXISTS `user_loginlog`;
CREATE TABLE `user_loginlog`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `create_time` datetime(6) NOT NULL,
  `login_ip` char(39) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `login_platform` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `login_imei` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `login_channel` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `user_id` int NOT NULL,
  `systemVersion` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `version` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ip_City` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ip_location` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone_model` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `netType` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_loginlog_user_id_020e8913_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_loginlog_user_id_020e8913_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 22739313 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_menu
-- ----------------------------
DROP TABLE IF EXISTS `user_menu`;
CREATE TABLE `user_menu`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `icon` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `link` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `pid` int NOT NULL,
  `sort` int NOT NULL,
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_enable` tinyint(1) NOT NULL,
  `api_url` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `target` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 215 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_node
-- ----------------------------
DROP TABLE IF EXISTS `user_node`;
CREATE TABLE `user_node`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `location` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `info` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort` smallint NOT NULL,
  `total_traffic` bigint NOT NULL,
  `used_traffic` bigint NOT NULL,
  `average_online_1hour` int NOT NULL,
  `bandwidth` int NOT NULL,
  `total_bandwidth` int NOT NULL,
  `code_version` int NOT NULL,
  `api_key` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `api_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ssh_port` smallint UNSIGNED NOT NULL,
  `reset_transfer_day` int NOT NULL,
  `provider` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `traffic_rate` int UNSIGNED NOT NULL,
  `amazon_region` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `node_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_hidden` tinyint(1) NOT NULL,
  `vip` int NULL DEFAULT NULL,
  `is_share` tinyint(1) NOT NULL,
  `devops_user` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `devops_password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `dockerName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ssh_key_id` int NULL DEFAULT NULL,
  `audit` tinyint(1) NOT NULL,
  `iam_key_id` int NULL DEFAULT NULL,
  `init_path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `instance_name` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `labels` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `node_init_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `uploadConnectLog` tinyint(1) NOT NULL,
  `useUDP` tinyint(1) NOT NULL,
  `isSelfNode` tinyint(1) NOT NULL,
  `node_container_id` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `node_group_id` int NULL DEFAULT NULL,
  `installBBR` tinyint(1) NOT NULL,
  `net_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ssh_host` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `node_init_way` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `subscript_group_name` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updateDNS` tinyint(1) NOT NULL,
  `cdn_domain_id` int NULL DEFAULT NULL,
  `gost_cdn` int NULL DEFAULT NULL,
  `gost_port` int NULL DEFAULT NULL,
  `gost_proto` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `max_port` int NOT NULL,
  `min_port` int NOT NULL,
  `node_domain_id` int NULL DEFAULT NULL,
  `show_gost` tinyint(1) NOT NULL,
  `isCustom` tinyint(1) NOT NULL,
  `showSSRNode` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ssh_private_key` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `ss_group_id` int NULL DEFAULT NULL,
  `ss_gost_port` int NULL DEFAULT NULL,
  `ss_gost_protocol` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `api_key`(`api_key` ASC) USING BTREE,
  INDEX `user_node_ssh_key_id_dfa3d920_fk_starhome_sshkeymodel_id`(`ssh_key_id` ASC) USING BTREE,
  INDEX `user_node_node_group_id_faf03e87_fk_user_ssrnodegroup_id`(`node_group_id` ASC) USING BTREE,
  INDEX `user_node_iam_key_id_fb6f6b45_fk_starhome_iamkeymodel_id`(`iam_key_id` ASC) USING BTREE,
  INDEX `user_node_cdn_domain_id_5dfd459c_fk_starhome_subdomainmodel_id`(`cdn_domain_id` ASC) USING BTREE,
  INDEX `user_node_node_domain_id_e95a3b8f_fk_starhome_subdomainmodel_id`(`node_domain_id` ASC) USING BTREE,
  INDEX `idx_4`(`is_hidden` ASC) USING BTREE,
  INDEX `idx_5`(`location` ASC) USING BTREE,
  INDEX `idx_6`(`node_type` ASC) USING BTREE,
  INDEX `idx_7`(`status` ASC) USING BTREE,
  CONSTRAINT `user_node_cdn_domain_id_5dfd459c_fk_starhome_subdomainmodel_id` FOREIGN KEY (`cdn_domain_id`) REFERENCES `starhome_subdomainmodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_node_iam_key_id_fb6f6b45_fk_starhome_iamkeymodel_id` FOREIGN KEY (`iam_key_id`) REFERENCES `starhome_iamkeymodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_node_node_domain_id_e95a3b8f_fk_starhome_subdomainmodel_id` FOREIGN KEY (`node_domain_id`) REFERENCES `starhome_subdomainmodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_node_node_group_id_faf03e87_fk_user_ssrnodegroup_id` FOREIGN KEY (`node_group_id`) REFERENCES `user_ssrnodegroup` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_node_ssh_key_id_dfa3d920_fk_starhome_sshkeymodel_id` FOREIGN KEY (`ssh_key_id`) REFERENCES `starhome_sshkeymodel` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 352 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_nodeaddinlist
-- ----------------------------
DROP TABLE IF EXISTS `user_nodeaddinlist`;
CREATE TABLE `user_nodeaddinlist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `port_list` int NULL DEFAULT NULL,
  `host` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `hidden` tinyint(1) NOT NULL,
  `node_id` int NULL DEFAULT NULL,
  `ha_host_id` int NULL DEFAULT NULL,
  `line_state` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_backup` tinyint(1) NOT NULL,
  `line_chk_status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `backend_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `HaLineBalance` tinyint(1) NOT NULL,
  `ha_dest_host` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ha_dest_port` int NULL DEFAULT NULL,
  `label` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_nodeaddinlist_node_id_a0ba0f8b_fk_user_node_id`(`node_id` ASC) USING BTREE,
  INDEX `user_nodeaddinlist_ha_host_id_745447ef_fk_user_haportlist_id`(`ha_host_id` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  CONSTRAINT `user_nodeaddinlist_ha_host_id_745447ef_fk_user_haportlist_id` FOREIGN KEY (`ha_host_id`) REFERENCES `user_haportlist` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_nodeaddinlist_node_id_a0ba0f8b_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2240 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_nodeloadconditions
-- ----------------------------
DROP TABLE IF EXISTS `user_nodeloadconditions`;
CREATE TABLE `user_nodeloadconditions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `cpu_used_percentage` int NOT NULL,
  `total_ram` bigint NOT NULL,
  `ram_used` bigint NOT NULL,
  `bytes_sent_sec` bigint NOT NULL,
  `bytes_recv_sec` bigint NOT NULL,
  `avg_rate` int NOT NULL,
  `load_conditions` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `node_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_nodeloadconditions_node_id_a4767fd1_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `user_nodeloadconditions_node_id_a4767fd1_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 26964335 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_nodetrafficrecordday
-- ----------------------------
DROP TABLE IF EXISTS `user_nodetrafficrecordday`;
CREATE TABLE `user_nodetrafficrecordday`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `tx` bigint NOT NULL,
  `rx` bigint NOT NULL,
  `create_date` datetime(6) NOT NULL,
  `update_time` datetime(6) NOT NULL,
  `summary_date` date NULL DEFAULT NULL,
  `node_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_nodetrafficrecordday_node_id_221f3a11_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `user_nodetrafficrecordday_node_id_221f3a11_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 94426 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_nodetrafficrecordmonth
-- ----------------------------
DROP TABLE IF EXISTS `user_nodetrafficrecordmonth`;
CREATE TABLE `user_nodetrafficrecordmonth`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `tx` bigint NOT NULL,
  `rx` bigint NOT NULL,
  `create_date` datetime(6) NOT NULL,
  `update_time` datetime(6) NOT NULL,
  `summary_date` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `node_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_nodetrafficrecordmonth_node_id_82fd2c1a_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `user_nodetrafficrecordmonth_node_id_82fd2c1a_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4822 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_role
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_enable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_role_permission
-- ----------------------------
DROP TABLE IF EXISTS `user_role_permission`;
CREATE TABLE `user_role_permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `menu_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_role_permission_role_id_menu_id_97c8065f_uniq`(`role_id` ASC, `menu_id` ASC) USING BTREE,
  INDEX `user_role_permission_menu_id_6325faf7_fk_user_menu_id`(`menu_id` ASC) USING BTREE,
  CONSTRAINT `user_role_permission_menu_id_6325faf7_fk_user_menu_id` FOREIGN KEY (`menu_id`) REFERENCES `user_menu` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_role_permission_role_id_bb17fa10_fk_user_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 370 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_ssrnodegroup
-- ----------------------------
DROP TABLE IF EXISTS `user_ssrnodegroup`;
CREATE TABLE `user_ssrnodegroup`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `method` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_multi_user` tinyint(1) NOT NULL,
  `multi_user_port` smallint UNSIGNED NOT NULL,
  `multi_user_passwd` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `protocol` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `protocol_param` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `obfs` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `obfs_param` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `netflix_redirect_node_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_user
-- ----------------------------
DROP TABLE IF EXISTS `user_user`;
CREATE TABLE `user_user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_login` datetime(6) NULL DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `avatar` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `port` smallint UNSIGNED NOT NULL,
  `passwd` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `t` int NOT NULL,
  `u` bigint NOT NULL,
  `d` bigint NOT NULL,
  `transfer_enable` bigint NOT NULL,
  `switch` tinyint(1) NOT NULL,
  `reg_ip` char(39) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `last_login_ip` char(39) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `subscriptions_url` varchar(192) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_online` tinyint(1) NOT NULL,
  `user_type` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `method` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `protocol` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `protocol_param` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `obfs` varchar(127) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `obfs_param` varchar(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `speed_limit` int NOT NULL,
  `channel` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `trial_platform` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `trial_imei` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `user_status` int NOT NULL,
  `isTrial` tinyint(1) NOT NULL,
  `mac_address` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone_model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `paid_user` tinyint(1) NOT NULL,
  `vip` int NOT NULL,
  `userFormatId` int NULL DEFAULT NULL,
  `expired_date` datetime(6) NULL DEFAULT NULL,
  `invite_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `invite_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_ios_active` tinyint(1) NOT NULL,
  `admin_role_id` int NULL DEFAULT NULL,
  `last_location` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `chinaNode` tinyint(1) NOT NULL,
  `foreignNode` tinyint(1) NOT NULL,
  `ssrNodeBack` tinyint(1) NOT NULL,
  `inviter_limit` tinyint(1) NOT NULL,
  `ios_pay_status` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `user_user_admin_role_id_68dd2169_fk_user_role_id`(`admin_role_id` ASC) USING BTREE,
  INDEX `idx_1`(`trial_imei` ASC) USING BTREE,
  INDEX `idx_2`(`trial_platform` ASC) USING BTREE,
  INDEX `idx_3`(`user_status` ASC) USING BTREE,
  CONSTRAINT `user_user_admin_role_id_68dd2169_fk_user_role_id` FOREIGN KEY (`admin_role_id`) REFERENCES `user_role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 955257 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_user_groups
-- ----------------------------
DROP TABLE IF EXISTS `user_user_groups`;
CREATE TABLE `user_user_groups`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_user_groups_user_id_group_id_bb60391f_uniq`(`user_id` ASC, `group_id` ASC) USING BTREE,
  INDEX `user_user_groups_group_id_c57f13c0_fk_auth_group_id`(`group_id` ASC) USING BTREE,
  CONSTRAINT `user_user_groups_group_id_c57f13c0_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_user_groups_user_id_13f9a20d_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_user_nodes
-- ----------------------------
DROP TABLE IF EXISTS `user_user_nodes`;
CREATE TABLE `user_user_nodes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `node_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_user_nodes_user_id_node_id_cd9ee470_uniq`(`user_id` ASC, `node_id` ASC) USING BTREE,
  INDEX `user_user_nodes_node_id_eae04979_fk_user_node_id`(`node_id` ASC) USING BTREE,
  CONSTRAINT `user_user_nodes_node_id_eae04979_fk_user_node_id` FOREIGN KEY (`node_id`) REFERENCES `user_node` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_user_nodes_user_id_ea35500b_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3609 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_user_user_permissions
-- ----------------------------
DROP TABLE IF EXISTS `user_user_user_permissions`;
CREATE TABLE `user_user_user_permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_user_user_permissions_user_id_permission_id_64f4d5b8_uniq`(`user_id` ASC, `permission_id` ASC) USING BTREE,
  INDEX `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm`(`permission_id` ASC) USING BTREE,
  CONSTRAINT `user_user_user_permi_permission_id_ce49d4de_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `user_user_user_permissions_user_id_31782f58_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_usertrafficplan
-- ----------------------------
DROP TABLE IF EXISTS `user_usertrafficplan`;
CREATE TABLE `user_usertrafficplan`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `u` bigint NOT NULL,
  `d` bigint NOT NULL,
  `transfer_enable` bigint NOT NULL,
  `effective_time` datetime(6) NOT NULL,
  `created_time` datetime(6) NOT NULL,
  `type` int NOT NULL,
  `user_id` int NOT NULL,
  `addTimes` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_usertrafficplan_user_id_fcc647b0_fk_user_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_usertrafficplan_user_id_fcc647b0_fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 419049 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_usertransferrecord
-- ----------------------------
DROP TABLE IF EXISTS `user_usertransferrecord`;
CREATE TABLE `user_usertransferrecord`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `u` bigint NOT NULL,
  `d` bigint NOT NULL,
  `create_date` date NOT NULL,
  `create_time` time(6) NOT NULL,
  `rate` int UNSIGNED NOT NULL,
  `node_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_usertransferrecord_create_date_7df16f38`(`create_date` ASC) USING BTREE,
  INDEX `user_usertransferrecord_user_id_3212b503`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_usertransferrecordday
-- ----------------------------
DROP TABLE IF EXISTS `user_usertransferrecordday`;
CREATE TABLE `user_usertransferrecordday`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `u` bigint NOT NULL,
  `d` bigint NOT NULL,
  `create_date` date NOT NULL,
  `create_time` time(6) NOT NULL,
  `rate` int UNSIGNED NOT NULL,
  `node_id` int NOT NULL,
  `user_id` int NOT NULL,
  `summary_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_usertransferrecordday_create_date_145fb499`(`create_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_usertransferrecordmonth
-- ----------------------------
DROP TABLE IF EXISTS `user_usertransferrecordmonth`;
CREATE TABLE `user_usertransferrecordmonth`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `u` bigint NOT NULL,
  `d` bigint NOT NULL,
  `create_date` date NOT NULL,
  `create_time` time(6) NOT NULL,
  `rate` int UNSIGNED NOT NULL,
  `node_id` int NOT NULL,
  `user_id` int NOT NULL,
  `summary_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_usertransferrecordmonth_create_date_eb8d9a3d`(`create_date` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
