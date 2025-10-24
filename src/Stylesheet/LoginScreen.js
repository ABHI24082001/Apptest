import {StyleSheet, Platform} from 'react-native';


const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  bannerImage: {
    width: '101%',
    height: 200,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    position: 'relative',
  },
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  innerContent: {
    paddingHorizontal: 25,
  },
  centerBanner: {
    position: 'absolute',
    top: 110,
    left: '50%',
    transform: [{translateX: -75}],
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 20,
  },
  otpWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 10,
    left: 15,
    zIndex: 99,
  },
});

export default styles;