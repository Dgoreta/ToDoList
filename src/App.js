import React,{ useState, useEffect } from 'react';
import './App.css';
import Form from './komponente/Form';
import TodoList from './komponente/TodoList';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

function App({ signOut, user }) {
  const [formState, setFormState] = useState(initialState)

  const [inputText,setInputText]=useState("");
  const [todos,setTodos]=useState([]);
  const [status,setStatus]=useState("all");
  const [filteredTodos,setFilteredTodos]=useState([]);


  useEffect(()=>{
    fetchTodos();
  },[])
  useEffect(()=>{
    filterHandler();
    saveLocalTodos();
  },[todos,status]);

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  const filterHandler=()=>{
    switch (status){
      case 'completed':
        setFilteredTodos(todos.filter(todo=> todo.completed===true));
        break;
        case 'uncompleted':
          setFilteredTodos(todos.filter(todo=> todo.completed===false));
          break;
        default:
          setFilteredTodos(todos);
          break;
    }
  };
  const saveLocalTodos=()=>{
        if(todos.length!==0){
          localStorage.setItem("todos", JSON.stringify(todos));
        }
}
  const getLocalTodos=()=>{
    if(localStorage.getItem("todos")===null){
      localStorage.setItem("todos", JSON.stringify([]));

    }else{
     let todoLocal= JSON.parse(localStorage.getItem("todos"));
     setTodos(todoLocal);

    }
  }
  return (

  <div className="App">
        <header>
          <div>
          <h1>{user.username} ToDo Lista V2</h1>
          <button className="button" onClick={signOut}>Sign out</button>
          </div>

        </header>
        <div className="todoList">
        <Form 
        todos={todos} 
        setTodos={setTodos} 
        inputText={inputText} 
        setInputText={setInputText}
        status={status}
        setStatus={setStatus}/>
        <TodoList todos={todos} 
        setTodos={setTodos}
        filteredTodos={filteredTodos}/>
        </div>


    </div>

  );
}

export default withAuthenticator(App);