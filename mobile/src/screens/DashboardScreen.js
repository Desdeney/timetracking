import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { taskService } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [taskName, setTaskName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const handleAddTask = async () => {
    if (!taskName.trim() || !customerName.trim()) {
      Alert.alert('Fehler', 'Aufgabenname und Kundenname sind erforderlich');
      return;
    }

    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;

    if (h === 0 && m === 0) {
      Alert.alert('Fehler', 'Dauer muss größer als 0 sein');
      return;
    }

    try {
      await taskService.addTask(taskName, customerName, description, h, m);
      Alert.alert('Erfolg', 'Aufgabe wurde hinzugefügt');
      setTaskName('');
      setCustomerName('');
      setDescription('');
      setHours('');
      setMinutes('');
    } catch (error) {
      Alert.alert('Fehler', error.response?.data?.error || 'Aufgabe konnte nicht gespeichert werden');
    }
  };

  const handleFeierabend = async () => {
    try {
      const result = await taskService.getFeierabend();
      const tasks = result.tasks || [];
      
      if (tasks.length === 0) {
        Alert.alert('Info', 'Keine Aufgaben für heute gefunden');
        return;
      }

      const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = totalMinutes % 60;

      const taskList = tasks.map(t => `• ${t.task_name} (${t.customer_name}): ${Math.floor(t.duration / 60)}h ${t.duration % 60}m`).join('\n');
      
      Alert.alert(
        'Feierabend - Heutige Aufgaben',
        `${taskList}\n\nGesamtzeit: ${totalHours}h ${totalMins}m`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Fehler', 'Aufgaben konnten nicht geladen werden');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.username}>Hallo, {user?.username}!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Abmelden</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Neue Aufgabe</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Aufgabenname *"
            value={taskName}
            onChangeText={setTaskName}
          />

          <TextInput
            style={styles.input}
            placeholder="Kundenname *"
            value={customerName}
            onChangeText={setCustomerName}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Beschreibung"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.durationContainer}>
            <View style={styles.durationInput}>
              <Text style={styles.label}>Stunden</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={hours}
                onChangeText={setHours}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.durationInput}>
              <Text style={styles.label}>Minuten</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleAddTask}>
            <Text style={styles.buttonText}>Aufgabe hinzufügen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.feierabendButton} onPress={handleFeierabend}>
            <Text style={styles.buttonText}>🏠 Feierabend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInput: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  feierabendButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DashboardScreen;
