import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { todoService } from '../services/api';

const TodoScreen = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const result = await todoService.getTodos();
      setTodos(result.todos || []);
    } catch (error) {
      Alert.alert('Fehler', 'ToDos konnten nicht geladen werden');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  };

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Titel ist erforderlich');
      return;
    }

    try {
      await todoService.createTodo(title, description);
      setTitle('');
      setDescription('');
      await loadTodos();
    } catch (error) {
      Alert.alert('Fehler', 'ToDo konnte nicht erstellt werden');
    }
  };

  const handleToggleTodo = async (id, currentDone) => {
    try {
      await todoService.updateTodo(id, !currentDone);
      await loadTodos();
    } catch (error) {
      Alert.alert('Fehler', 'ToDo konnte nicht aktualisiert werden');
    }
  };

  const handleDeleteTodo = async (id) => {
    Alert.alert(
      'Bestätigen',
      'Möchten Sie dieses ToDo wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await todoService.deleteTodo(id);
              await loadTodos();
            } catch (error) {
              Alert.alert('Fehler', 'ToDo konnte nicht gelöscht werden');
            }
          },
        },
      ]
    );
  };

  const renderTodo = ({ item }) => (
    <View style={styles.todoCard}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => handleToggleTodo(item.id, item.done)}
      >
        <View style={styles.checkbox}>
          {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <View style={styles.todoText}>
          <Text style={[styles.todoTitle, item.done && styles.todoTitleDone]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.todoDescription}>{item.description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTodo(item.id)}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ToDo Liste</Text>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Titel *"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beschreibung"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
          <Text style={styles.addButtonText}>+ ToDo hinzufügen</Text>
        </TouchableOpacity>
      </View>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keine ToDos vorhanden</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  todoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  todoText: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todoDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 28,
    color: '#FF3B30',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default TodoScreen;
