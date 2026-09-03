import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Services
import ServicesScreen from '../screens/services/ServicesScreen';
import ServiceDetailsScreen from '../screens/services/ServiceDetailsScreen';
import ServiceApplicationScreen from '../screens/services/ServiceApplicationScreen';
import ApplicationSuccessScreen from '../screens/services/ApplicationSuccessScreen';
import MyApplicationsScreen from '../screens/services/MyApplicationsScreen';
// Auto & Ambulance
import AutoHomeScreen from '../screens/auto/AutoHomeScreen';
import AutoBookingScreen from '../screens/auto/AutoBookingScreen';
import AmbulanceHomeScreen from '../screens/ambulance/AmbulanceHomeScreen';
import AmbulanceBookingScreen from '../screens/ambulance/AmbulanceBookingScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
// Blood
import BloodHomeScreen from '../screens/blood/BloodHomeScreen';
import BloodDonorsScreen from '../screens/blood/BloodDonorsScreen';
import DonorDetailsScreen from '../screens/blood/DonorDetailsScreen';
import BecomeDonorScreen from '../screens/blood/BecomeDonorScreen';
import CreateBloodRequestScreen from '../screens/blood/CreateBloodRequestScreen';
import BloodRequestSuccessScreen from '../screens/blood/BloodRequestSuccessScreen';
import MyBloodRequestsScreen from '../screens/blood/MyBloodRequestsScreen';
// Pass
import PassHomeScreen from '../screens/pass/PassHomeScreen';
import ApplyPassScreen from '../screens/pass/ApplyPassScreen';
import PassSuccessScreen from '../screens/pass/PassSuccessScreen';
import MyPassesScreen from '../screens/pass/MyPassesScreen';
import PassDetailsScreen from '../screens/pass/PassDetailsScreen';
// Donation
import DonationHomeScreen from '../screens/donation/DonationHomeScreen';
import DonationFormScreen from '../screens/donation/DonationFormScreen';
import DonationPaymentScreen from '../screens/donation/DonationPaymentScreen';
import DonationHistoryScreen from '../screens/donation/DonationHistoryScreen';
// Membership
import MembershipHomeScreen from '../screens/membership/MembershipHomeScreen';
// Gallery
import GalleryScreen from '../screens/gallery/GalleryScreen';
import PhotoDetailsScreen from '../screens/gallery/PhotoDetailsScreen';
import VideoPlayerScreen from '../screens/gallery/VideoPlayerScreen';
// Career
import CareerScreen from '../screens/career/CareerScreen';
import JobDetailsScreen from '../screens/career/JobDetailsScreen';
import ApplyJobScreen from '../screens/career/ApplyJobScreen';
import MyJobApplicationsScreen from '../screens/career/MyJobApplicationsScreen';
// Complaint
import ComplaintHomeScreen from '../screens/complaint/ComplaintHomeScreen';
import NewComplaintScreen from '../screens/complaint/NewComplaintScreen';
import ComplaintSuccessScreen from '../screens/complaint/ComplaintSuccessScreen';
import MyComplaintsScreen from '../screens/complaint/MyComplaintsScreen';
import ComplaintDetailsScreen from '../screens/complaint/ComplaintDetailsScreen';

const Stack = createNativeStackNavigator();

export default function ServicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesHome" component={ServicesScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ServiceApplication" component={ServiceApplicationScreen} />
      <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />

      <Stack.Screen name="AutoHome" component={AutoHomeScreen} />
      <Stack.Screen name="AutoBooking" component={AutoBookingScreen} />
      <Stack.Screen name="AmbulanceHome" component={AmbulanceHomeScreen} />
      <Stack.Screen name="AmbulanceBooking" component={AmbulanceBookingScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />

      <Stack.Screen name="BloodHome" component={BloodHomeScreen} />
      <Stack.Screen name="BloodDonors" component={BloodDonorsScreen} />
      <Stack.Screen name="DonorDetails" component={DonorDetailsScreen} />
      <Stack.Screen name="BecomeDonor" component={BecomeDonorScreen} />
      <Stack.Screen name="CreateBloodRequest" component={CreateBloodRequestScreen} />
      <Stack.Screen name="BloodRequestSuccess" component={BloodRequestSuccessScreen} />
      <Stack.Screen name="MyBloodRequests" component={MyBloodRequestsScreen} />

      <Stack.Screen name="ComplaintHome" component={ComplaintHomeScreen} />
      <Stack.Screen name="NewComplaint" component={NewComplaintScreen} />
      <Stack.Screen name="ComplaintSuccess" component={ComplaintSuccessScreen} />
      <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} />
      <Stack.Screen name="ComplaintDetails" component={ComplaintDetailsScreen} />
      <Stack.Screen name="PassHome" component={PassHomeScreen} />
      <Stack.Screen name="ApplyPass" component={ApplyPassScreen} />
      <Stack.Screen name="PassSuccess" component={PassSuccessScreen} />
      <Stack.Screen name="MyPasses" component={MyPassesScreen} />
      <Stack.Screen name="PassDetails" component={PassDetailsScreen} />

      <Stack.Screen name="DonationHome" component={DonationHomeScreen} />
      <Stack.Screen name="DonationForm" component={DonationFormScreen} />
      <Stack.Screen name="DonationPayment" component={DonationPaymentScreen} />
      <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} />

      <Stack.Screen name="MembershipHome" component={MembershipHomeScreen} />

      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="PhotoDetails" component={PhotoDetailsScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />

      <Stack.Screen name="CareerHome" component={CareerScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
      <Stack.Screen name="MyJobApplications" component={MyJobApplicationsScreen} />
    </Stack.Navigator>
  );
}
