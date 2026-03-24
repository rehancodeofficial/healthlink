-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 04, 2025 at 08:45 PM
-- Server version: 10.1.29-MariaDB
-- PHP Version: 7.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `curevirtual`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylog`
--

CREATE TABLE `activitylog` (
  `id` int(11) NOT NULL,
  `actorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorRole` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activitylog`
--

INSERT INTO `activitylog` (`id`, `actorId`, `actorRole`, `action`, `entity`, `createdAt`) VALUES
(1, '653ee412-6963-4aba-acd0-bc5910a367ae', 'DOCTOR', 'Created prescription', 'Prescription:seed-rx-1', '2025-11-04 19:19:35.333'),
(2, 'bd852968-2706-46db-bd7e-680888e17211', 'PATIENT', 'Booked appointment', 'Appointment:seed-appt-1', '2025-11-04 19:19:35.333');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPERADMIN','ADMIN','SUPPORT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ADMIN',
  `token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSuspended` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`, `role`, `token`, `isSuspended`, `createdAt`, `updatedAt`) VALUES
(1, 'Super Admin', 'superadmin@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'SUPERADMIN', NULL, 0, '2025-11-04 19:19:34.992', '2025-11-04 19:19:34.992'),
(2, 'James Admin', 'Admin@curevirtual.com', '123456', 'ADMIN', NULL, 0, '2025-11-04 19:32:17.077', '2025-11-04 19:32:17.077'),
(3, 'Patient Luka', 'support@curevirtual.com', '123456', 'SUPPORT', NULL, 0, '2025-11-04 19:32:47.823', '2025-11-04 19:32:47.823');

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointmentDate` datetime(3) NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`id`, `doctorId`, `patientId`, `appointmentDate`, `reason`, `status`, `createdAt`, `updatedAt`) VALUES
('e9ed7c24-1bc2-4273-800c-915c0d0f527b', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', '2025-11-05 19:38:00.000', 'Check up', 'PENDING', '2025-11-04 19:38:56.447', '2025-11-04 19:38:56.447'),
('seed-appt-1', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', '2025-11-05 19:19:35.210', 'Headache & fatigue', 'PENDING', '2025-11-04 19:19:35.222', '2025-11-04 19:19:35.222');

-- --------------------------------------------------------

--
-- Table structure for table `doctorpatient`
--

CREATE TABLE `doctorpatient` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctorpatient`
--

INSERT INTO `doctorpatient` (`id`, `doctorId`, `patientId`, `createdAt`) VALUES
('4ba04ced-3353-4b1d-a922-4c53a188980c', '683d8041-2cd5-4db1-b793-fe45b7f5337d', 'b74bbe9a-2278-43dc-807f-113b373b4349', '2025-11-04 19:19:35.194'),
('8a38df5b-379e-4f18-b660-4180c6e8532d', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', '2025-11-04 19:19:35.178'),
('8fb542c9-1ab6-40cf-8b8b-5cc47797e28c', 'b1ae5048-d181-466e-ac56-10ba3cb090f2', '0da57db9-31f1-4d07-a1af-e915980a66ef', '2025-11-04 19:19:35.188');

-- --------------------------------------------------------

--
-- Table structure for table `doctorprofile`
--

CREATE TABLE `doctorprofile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qualifications` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hospitalAffiliation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `yearsOfExperience` int(11) DEFAULT NULL,
  `consultationFee` double NOT NULL,
  `availability` longtext COLLATE utf8mb4_unicode_ci,
  `bio` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `languages` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctorprofile`
--

INSERT INTO `doctorprofile` (`id`, `userId`, `specialization`, `qualifications`, `licenseNumber`, `hospitalAffiliation`, `yearsOfExperience`, `consultationFee`, `availability`, `bio`, `languages`, `createdAt`, `updatedAt`) VALUES
('1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '653ee412-6963-4aba-acd0-bc5910a367ae', 'General Practice', 'MBBS, FWACP', 'DOC-0001', 'CureVirtual Clinic', 15, 30, 'Weekdays 09:00–17:00', 'Primary care physician with interest in preventive medicine.', 'English, Yoruba', '2025-11-04 19:19:35.107', '2025-11-04 19:40:17.679'),
('683d8041-2cd5-4db1-b793-fe45b7f5337d', 'b46369c4-a34f-492f-bd2d-ef34a4969da3', 'General Practice', 'MBBS, FWACP', 'DOC-0003', 'CureVirtual Clinic', 7, 40, 'Weekdays 09:00–17:00', 'Primary care physician with interest in preventive medicine.', 'English, Yoruba', '2025-11-04 19:19:35.130', '2025-11-04 19:19:35.130'),
('b1ae5048-d181-466e-ac56-10ba3cb090f2', '3842d71f-52d7-4969-ba48-e11e85171976', 'General Practice', 'MBBS, FWACP', 'DOC-0002', 'CureVirtual Clinic', 6, 35, 'Weekdays 09:00–17:00', 'Primary care physician with interest in preventive medicine.', 'English, Yoruba', '2025-11-04 19:19:35.122', '2025-11-04 19:19:35.122');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `readAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `senderId`, `receiverId`, `content`, `createdAt`, `readAt`) VALUES
('seed-msg-1', 'bd852968-2706-46db-bd7e-680888e17211', '653ee412-6963-4aba-acd0-bc5910a367ae', 'Hello Doctor, I booked an appointment for tomorrow.', '2025-11-04 19:19:35.265', NULL),
('seed-msg-2', '653ee412-6963-4aba-acd0-bc5910a367ae', 'bd852968-2706-46db-bd7e-680888e17211', 'Got it! Please come with your previous prescriptions.', '2025-11-04 19:19:35.275', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `patientprofile`
--

CREATE TABLE `patientprofile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dateOfBirth` datetime(3) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER','PREFER_NOT_TO_SAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `bloodGroup` enum('A+','A-','B+','B-','AB+','AB-','O+','O-','UNKNOWN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `height` double DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `allergies` longtext COLLATE utf8mb4_unicode_ci,
  `medications` longtext COLLATE utf8mb4_unicode_ci,
  `medicalHistory` longtext COLLATE utf8mb4_unicode_ci,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicalRecordNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insuranceProvider` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insuranceMemberId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContact` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `selectedPharmacyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patientprofile`
--

INSERT INTO `patientprofile` (`id`, `userId`, `dateOfBirth`, `gender`, `bloodGroup`, `height`, `weight`, `allergies`, `medications`, `medicalHistory`, `address`, `medicalRecordNumber`, `insuranceProvider`, `insuranceMemberId`, `emergencyContact`, `createdAt`, `updatedAt`, `selectedPharmacyId`) VALUES
('0da57db9-31f1-4d07-a1af-e915980a66ef', '4de3ba63-3a54-4da3-9fa7-732ee2fdcc02', '1991-05-20 00:00:00.000', 'FEMALE', 'O+', 1.72, 73, NULL, 'Vitamin D 1000IU', 'No chronic illnesses.', 'No. 3 Patient Road, Lekki', 'MRN-0002', NULL, NULL, 'Jane Doe 2, +2348000000002', '2025-11-04 19:19:35.159', '2025-11-04 19:19:35.159', 'c06fddce-4322-414f-a2e3-bc134e40f91a'),
('7cc6036a-e5ab-4a15-b3a9-902daa1683a5', 'bd852968-2706-46db-bd7e-680888e17211', '1990-05-20 00:00:00.000', 'MALE', 'O+', 172, 70, 'Penicillin', 'Vitamin D 1000IU', 'No chronic illnesses.', 'No. 2 Patient Road, Lekki', 'MRN-0001', '', '', 'Jane Doe 1, +2348000000001', '2025-11-04 19:19:35.139', '2025-11-04 19:37:42.237', 'c06fddce-4322-414f-a2e3-bc134e40f91a'),
('b74bbe9a-2278-43dc-807f-113b373b4349', '267ac3a4-642e-43c2-aa20-bb5a03de7f3b', '1992-05-20 00:00:00.000', 'MALE', 'O+', 1.74, 76, NULL, 'Vitamin D 1000IU', 'No chronic illnesses.', 'No. 4 Patient Road, Lekki', 'MRN-0003', NULL, NULL, 'Jane Doe 3, +2348000000003', '2025-11-04 19:19:35.169', '2025-11-04 19:19:35.169', 'c06fddce-4322-414f-a2e3-bc134e40f91a');

-- --------------------------------------------------------

--
-- Table structure for table `pharmacyprofile`
--

CREATE TABLE `pharmacyprofile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `displayName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `licenseNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postalCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `openingHours` longtext COLLATE utf8mb4_unicode_ci,
  `services` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pharmacyprofile`
--

INSERT INTO `pharmacyprofile` (`id`, `userId`, `displayName`, `licenseNumber`, `phone`, `address`, `city`, `state`, `country`, `postalCode`, `latitude`, `longitude`, `openingHours`, `services`, `createdAt`, `updatedAt`) VALUES
('c06fddce-4322-414f-a2e3-bc134e40f91a', 'c5c4d149-1f6d-4768-bc29-596324f5e060', 'CureVirtual Main Pharmacy', 'PHARM-0001', '+2348000000000', '1 Health Avenue, Ikeja', 'Lagos', 'Lagos', 'Nigeria', '100001', 6.6018, 3.3515, 'Mon–Sat 8:00–18:00', 'Dispensing; Home Delivery; Counseling', '2025-11-04 19:19:35.048', '2025-11-04 19:19:35.048');

-- --------------------------------------------------------

--
-- Table structure for table `prescription`
--

CREATE TABLE `prescription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medication` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `pharmacyId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dispatchStatus` enum('NONE','SENT','ACKNOWLEDGED','READY','DISPENSED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NONE',
  `dispatchedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `prescription`
--

INSERT INTO `prescription` (`id`, `doctorId`, `patientId`, `medication`, `dosage`, `frequency`, `duration`, `notes`, `createdAt`, `updatedAt`, `pharmacyId`, `dispatchStatus`, `dispatchedAt`) VALUES
('cmhkz3ig20001u6jg3z7866et', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', 'Paracetamol', '19mg', '2 X Daily', '3 Days', 'with water', '2025-11-04 19:39:43.770', '2025-11-04 19:39:43.791', 'c06fddce-4322-414f-a2e3-bc134e40f91a', 'SENT', '2025-11-04 19:39:43.790'),
('seed-rx-1', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', 'Paracetamol 500mg', '1 tablet', 'Every 8 hours', '5 days', 'Take with food.', '2025-11-04 19:19:35.247', '2025-11-04 19:19:35.247', 'c06fddce-4322-414f-a2e3-bc134e40f91a', 'READY', '2025-11-04 19:19:35.235');

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

CREATE TABLE `subscription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan` enum('MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('UNSUBSCRIBED','PENDING','ACTIVE','EXPIRED','DEACTIVATED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription`
--

INSERT INTO `subscription` (`id`, `userId`, `plan`, `status`, `provider`, `reference`, `amount`, `currency`, `startDate`, `endDate`, `createdAt`, `updatedAt`) VALUES
('5a077b18-b2b9-4665-9752-acfd295659c8', '653ee412-6963-4aba-acd0-bc5910a367ae', 'MONTHLY', 'ACTIVE', 'STRIPE', 'sub-DOCTOR-001', 2000, 'USD', '2025-11-04 19:19:35.188', '2025-12-04 19:19:35.188', '2025-11-04 19:19:35.201', '2025-11-04 19:19:35.201');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptionsetting`
--

CREATE TABLE `subscriptionsetting` (
  `id` int(11) NOT NULL DEFAULT '1',
  `doctorMonthlyUsd` double DEFAULT NULL,
  `doctorYearlyUsd` double DEFAULT NULL,
  `patientMonthlyUsd` double DEFAULT NULL,
  `patientYearlyUsd` double DEFAULT NULL,
  `pharmacyMonthlyUsd` double DEFAULT NULL,
  `pharmacyYearlyUsd` double DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptionsetting`
--

INSERT INTO `subscriptionsetting` (`id`, `doctorMonthlyUsd`, `doctorYearlyUsd`, `patientMonthlyUsd`, `patientYearlyUsd`, `pharmacyMonthlyUsd`, `pharmacyYearlyUsd`, `createdAt`, `updatedAt`) VALUES
(1, 20, 200, 5, 50, 15, 150, '2025-11-04 19:19:34.924', '2025-11-04 19:19:34.924');

-- --------------------------------------------------------

--
-- Table structure for table `supportagent`
--

CREATE TABLE `supportagent` (
  `id` int(11) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supportreply`
--

CREATE TABLE `supportreply` (
  `id` int(11) NOT NULL,
  `ticketId` int(11) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adminId` int(11) DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supportreply`
--

INSERT INTO `supportreply` (`id`, `ticketId`, `userId`, `adminId`, `message`, `createdAt`) VALUES
(1, 1, 'bd852968-2706-46db-bd7e-680888e17211', NULL, 'This happens on my phone. Please advise.', '2025-11-04 19:19:35.314');

-- --------------------------------------------------------

--
-- Table structure for table `supportticket`
--

CREATE TABLE `supportticket` (
  `id` int(11) NOT NULL,
  `ticketNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` int(11) DEFAULT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('OPEN','IN_PROGRESS','RESOLVED','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPEN',
  `priority` enum('LOW','MEDIUM','HIGH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supportticket`
--

INSERT INTO `supportticket` (`id`, `ticketNo`, `userId`, `agentId`, `subject`, `body`, `status`, `priority`, `createdAt`, `updatedAt`) VALUES
(1, 'seed-tkt-1', 'bd852968-2706-46db-bd7e-680888e17211', NULL, 'Unable to join video room', 'The video room link shows an error.', 'OPEN', 'MEDIUM', '2025-11-04 19:19:35.281', '2025-11-04 19:19:35.281');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('DOCTOR','PATIENT','PHARMACY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PATIENT',
  `subscriptionState` enum('UNSUBSCRIBED','PENDING','ACTIVE','EXPIRED','DEACTIVATED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNSUBSCRIBED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `role`, `subscriptionState`, `createdAt`, `updatedAt`) VALUES
('267ac3a4-642e-43c2-aa20-bb5a03de7f3b', 'Patience Patient 3', 'patient3@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'PATIENT', 'UNSUBSCRIBED', '2025-11-04 19:19:35.100', '2025-11-04 19:19:35.100'),
('3842d71f-52d7-4969-ba48-e11e85171976', 'Dr. John Doctor 2', 'doctor2@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'DOCTOR', 'UNSUBSCRIBED', '2025-11-04 19:19:35.071', '2025-11-04 19:19:35.071'),
('4de3ba63-3a54-4da3-9fa7-732ee2fdcc02', 'Patience Patient 2', 'patient2@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'PATIENT', 'UNSUBSCRIBED', '2025-11-04 19:19:35.094', '2025-11-04 19:19:35.094'),
('653ee412-6963-4aba-acd0-bc5910a367ae', 'Dr. John Doctor 1', 'doctor1@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'DOCTOR', 'ACTIVE', '2025-11-04 19:19:35.063', '2025-11-04 19:19:35.210'),
('b46369c4-a34f-492f-bd2d-ef34a4969da3', 'Dr. John Doctor 3', 'doctor3@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'DOCTOR', 'UNSUBSCRIBED', '2025-11-04 19:19:35.080', '2025-11-04 19:19:35.080'),
('bd852968-2706-46db-bd7e-680888e17211', 'Patience Patient 1', 'patient1@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'PATIENT', 'UNSUBSCRIBED', '2025-11-04 19:19:35.087', '2025-11-04 19:19:35.087'),
('c5c4d149-1f6d-4768-bc29-596324f5e060', 'CureVirtual Pharmacy', 'pharmacy@curevirtual.com', '$2b$10$EGY5d8Jmjc9zDlWJSCo89uxsNtodl8qxUw/LE2mgQIdXyy/x5AAlu', 'PHARMACY', 'UNSUBSCRIBED', '2025-11-04 19:19:35.009', '2025-11-04 19:19:35.009');

-- --------------------------------------------------------

--
-- Table structure for table `videoconsultation`
--

CREATE TABLE `videoconsultation` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patientId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduledAt` datetime(3) NOT NULL,
  `durationMins` int(11) DEFAULT NULL,
  `status` enum('SCHEDULED','ONGOING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `roomName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meetingUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videoconsultation`
--

INSERT INTO `videoconsultation` (`id`, `doctorId`, `patientId`, `title`, `notes`, `scheduledAt`, `durationMins`, `status`, `roomName`, `meetingUrl`, `createdAt`, `updatedAt`) VALUES
('006eb07c-799f-4c45-92b5-1c0d808029c8', '683d8041-2cd5-4db1-b793-fe45b7f5337d', 'b74bbe9a-2278-43dc-807f-113b373b4349', NULL, NULL, '2025-11-05 19:44:00.000', 30, 'SCHEDULED', NULL, NULL, '2025-11-04 19:44:50.065', '2025-11-04 19:44:50.065'),
('68b5ed0f-22b4-4cf5-8a98-f53e724888fd', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', NULL, NULL, '2025-11-07 19:39:00.000', 30, 'SCHEDULED', NULL, NULL, '2025-11-04 19:39:58.063', '2025-11-04 19:39:58.063'),
('f91934fb-e6f9-4b78-bece-fb4ae68a9302', '683d8041-2cd5-4db1-b793-fe45b7f5337d', 'b74bbe9a-2278-43dc-807f-113b373b4349', NULL, NULL, '2025-11-05 19:43:00.000', 30, 'COMPLETED', NULL, NULL, '2025-11-04 19:44:02.556', '2025-11-04 19:44:26.251'),
('seed-vc-1', '1e8e456f-7a87-45c7-a407-1d2d6e9523ea', '7cc6036a-e5ab-4a15-b3a9-902daa1683a5', 'Initial Teleconsult', 'Review symptoms and vitals.', '2025-11-05 19:19:35.210', 30, 'SCHEDULED', 'curevirtual-room-1', 'https://meet.curevirtual.com/room-1', '2025-11-04 19:19:35.237', '2025-11-04 19:19:35.237');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('df93bf39-5c23-48ef-a428-4461d4fc5e7f', '090373408b68d32040e4e70a7e9a95bfbad93b4c747f15ac4eaa9f0764ddc0c9', '2025-11-04 19:11:47.920', '20251104191145_init', NULL, NULL, '2025-11-04 19:11:45.336', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_email_key` (`email`),
  ADD UNIQUE KEY `admin_token_key` (`token`);

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Appointment_doctorId_idx` (`doctorId`),
  ADD KEY `Appointment_patientId_idx` (`patientId`);

--
-- Indexes for table `doctorpatient`
--
ALTER TABLE `doctorpatient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DoctorPatient_doctorId_patientId_key` (`doctorId`,`patientId`),
  ADD KEY `DoctorPatient_patientId_idx` (`patientId`),
  ADD KEY `DoctorPatient_doctorId_idx` (`doctorId`);

--
-- Indexes for table `doctorprofile`
--
ALTER TABLE `doctorprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DoctorProfile_userId_key` (`userId`),
  ADD UNIQUE KEY `DoctorProfile_licenseNumber_key` (`licenseNumber`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Message_senderId_fkey` (`senderId`),
  ADD KEY `Message_receiverId_fkey` (`receiverId`);

--
-- Indexes for table `patientprofile`
--
ALTER TABLE `patientprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PatientProfile_userId_key` (`userId`),
  ADD UNIQUE KEY `PatientProfile_medicalRecordNumber_key` (`medicalRecordNumber`),
  ADD KEY `PatientProfile_selectedPharmacyId_fkey` (`selectedPharmacyId`);

--
-- Indexes for table `pharmacyprofile`
--
ALTER TABLE `pharmacyprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PharmacyProfile_userId_key` (`userId`);

--
-- Indexes for table `prescription`
--
ALTER TABLE `prescription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Prescription_doctorId_idx` (`doctorId`),
  ADD KEY `Prescription_patientId_idx` (`patientId`),
  ADD KEY `Prescription_pharmacyId_idx` (`pharmacyId`);

--
-- Indexes for table `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Subscription_reference_key` (`reference`),
  ADD KEY `Subscription_userId_idx` (`userId`),
  ADD KEY `Subscription_status_idx` (`status`),
  ADD KEY `Subscription_plan_idx` (`plan`);

--
-- Indexes for table `subscriptionsetting`
--
ALTER TABLE `subscriptionsetting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supportagent`
--
ALTER TABLE `supportagent`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SupportAgent_userId_key` (`userId`);

--
-- Indexes for table `supportreply`
--
ALTER TABLE `supportreply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupportReply_ticketId_fkey` (`ticketId`),
  ADD KEY `SupportReply_userId_fkey` (`userId`),
  ADD KEY `SupportReply_adminId_fkey` (`adminId`);

--
-- Indexes for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SupportTicket_ticketNo_key` (`ticketNo`),
  ADD KEY `SupportTicket_userId_fkey` (`userId`),
  ADD KEY `SupportTicket_agentId_fkey` (`agentId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `videoconsultation`
--
ALTER TABLE `videoconsultation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `VideoConsultation_doctorId_idx` (`doctorId`),
  ADD KEY `VideoConsultation_patientId_idx` (`patientId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activitylog`
--
ALTER TABLE `activitylog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supportagent`
--
ALTER TABLE `supportagent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supportreply`
--
ALTER TABLE `supportreply`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `supportticket`
--
ALTER TABLE `supportticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointment`
--
ALTER TABLE `appointment`
  ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctorprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patientprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctorpatient`
--
ALTER TABLE `doctorpatient`
  ADD CONSTRAINT `DoctorPatient_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctorprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DoctorPatient_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patientprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctorprofile`
--
ALTER TABLE `doctorprofile`
  ADD CONSTRAINT `DoctorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `patientprofile`
--
ALTER TABLE `patientprofile`
  ADD CONSTRAINT `PatientProfile_selectedPharmacyId_fkey` FOREIGN KEY (`selectedPharmacyId`) REFERENCES `pharmacyprofile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `PatientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pharmacyprofile`
--
ALTER TABLE `pharmacyprofile`
  ADD CONSTRAINT `PharmacyProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `prescription`
--
ALTER TABLE `prescription`
  ADD CONSTRAINT `Prescription_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctorprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patientprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Prescription_pharmacyId_fkey` FOREIGN KEY (`pharmacyId`) REFERENCES `pharmacyprofile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supportagent`
--
ALTER TABLE `supportagent`
  ADD CONSTRAINT `SupportAgent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supportreply`
--
ALTER TABLE `supportreply`
  ADD CONSTRAINT `SupportReply_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `SupportReply_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `supportticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `SupportReply_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supportticket`
--
ALTER TABLE `supportticket`
  ADD CONSTRAINT `SupportTicket_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `supportagent` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `videoconsultation`
--
ALTER TABLE `videoconsultation`
  ADD CONSTRAINT `VideoConsultation_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctorprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `VideoConsultation_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patientprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
