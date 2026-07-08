import React, {Component, ReactNode} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false, error: null};

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <TouchableOpacity style={styles.button} onPress={() => this.setState({hasError: false, error: null})}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16},
  title: {fontSize: 18, color: '#333', marginBottom: 16},
  button: {backgroundColor: '#4CAF50', padding: 12, borderRadius: 8},
  buttonText: {color: '#fff', fontWeight: '600'},
});
