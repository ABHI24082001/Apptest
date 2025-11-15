import {useState} from 'react';

const useFeedback = () => {
  const [feedbackState, setFeedbackState] = useState({
    visible: false,
    type: 'success',
    message: '',
    title: '',
    autoClose: true,
    duration: 3000,
    showCloseButton: false,
  });

  const showFeedback = (options) => {
    if (typeof options === 'string') {
      // Simple usage: showFeedback('Success message')
      setFeedbackState({
        visible: true,
        type: 'success',
        message: options,
        title: '',
        autoClose: true,
        duration: 3000,
        showCloseButton: false,
      });
    } else {
      // Advanced usage: showFeedback({ type: 'success', message: 'Done!', title: 'Great!' })
      setFeedbackState({
        visible: true,
        type: 'success',
        message: '',
        title: '',
        autoClose: true,
        duration: 3000,
        showCloseButton: false,
        ...options,
      });
    }
  };

  const hideFeedback = () => {
    setFeedbackState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  // Convenience methods
  const showSuccess = (message, title = 'Success!') => {
    showFeedback({ type: 'success', message, title });
  };

  const showError = (message, title = 'Error!') => {
    showFeedback({ type: 'fail', message, title });
  };

  const showWarning = (message, title = 'Warning!') => {
    showFeedback({ type: 'warning', message, title });
  };

  const showInfo = (message, title = 'Information') => {
    showFeedback({ type: 'info', message, title });
  };

  const showDeleted = (message, title = 'Deleted!') => {
    showFeedback({ type: 'deleted', message, title });
  };

  return {
    feedbackState,
    showFeedback,
    hideFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDeleted,
  };
};

export default useFeedback;
