import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of page range to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Showing {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </Text>
      </View>
      <View style={styles.paginationContainer}>
        {/* Previous button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}>
          <Icon
            name="chevron-left"
            size={16}
            color={currentPage === 1 ? '#9CA3AF' : '#4B5563'}
          />
        </TouchableOpacity>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <TouchableOpacity
            key={`page-${index}`}
            style={[
              styles.pageButton,
              page === currentPage && styles.activePageButton,
              page === '...' && styles.ellipsisButton,
            ]}
            onPress={() => page !== '...' && onPageChange(page)}
            disabled={page === '...' || page === currentPage}>
            <Text
              style={[
                styles.pageText,
                page === currentPage && styles.activePageText,
              ]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Next button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          disabled={currentPage === totalPages}>
          <Icon
            name="chevron-right"
            size={16}
            color={currentPage === totalPages ? '#9CA3AF' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  infoContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  ellipsisButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pageText: {
    fontSize: 14,
    color: '#4B5563',
  },
  activePageText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Pagination;
