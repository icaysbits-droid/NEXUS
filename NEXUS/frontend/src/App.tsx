import './App.css'
import Button from '@mui/material/Button';

function App() {
  return (
    <>
      <div>
        <nav>
          <ul>
            <li><a href="">Home</a></li>
            <li><a href="">About</a></li>
            <li><a href="">Contact</a></li>
          </ul>
        </nav>
      </div>
      <div>
        <h1>Hola mundo Nexus</h1>
      </div>
      <div>
        <table>
          <tr>
            <td>id</td>
            <td>name</td>
            <td>email</td>
          </tr>
          <tr>
            <td>1</td>
            <td>Juan</td>
            <td>[EMAIL_ADDRESS]</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Maria</td>
            <td>[EMAIL_ADDRESS]</td>
          </tr>
        </table>
      </div>
      <div>
        <Button variant="contained">Primary
          
        </Button>
      </div>
    </>
  )
}

export default App