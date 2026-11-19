import {Linking} from 'react-native';

// The app's developer: shown in the side menu and on the "work with me"
// page. Change details here only.
export const DEVELOPER = {
  name: 'Tariq Monowar Hossain',
  role: 'Full Stack Software Developer',
  whatsapp: '8801908880294', // country code + number, no "+" or spaces
  whatsappDisplay: '+880 1908-880294',
  facebook: 'https://www.facebook.com/profile.php?id=100080938471859',
  linkedin: 'https://bd.linkedin.com/in/tariq-monowar-hossainnnn',
};

// Opens a WhatsApp chat with a first message already written.
export const openWhatsApp = (message: string) => {
  const url = `https://wa.me/${DEVELOPER.whatsapp}?text=${encodeURIComponent(
    message,
  )}`;
  return Linking.openURL(url);
};
