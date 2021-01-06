import './App.css';
import Logo from './Components/Logo/Logo';
import Navigation from './Components/Navigation/Navigation';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import { useEffect, useState } from 'react';
import Clarifai from 'clarifai';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';


const app = new Clarifai.App({
  apiKey: 'db3aa205ff7740ca98a14e7419c00cd0'
})

function App() {

  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [box, setBox] = useState({})
  const [route, setRoute] = useState('signin')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState({
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
  })
  

  useEffect(() => {

    fetch('http://localhost:5000/')
      .then(response => response.json())
      .then(console.log)

  }, [])

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    })
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol : clarifaiFace.left_col * width,
      rightCol : width - (clarifaiFace.right_col * width),
      topRow : clarifaiFace.top_row * height,
      bottomRow : height - (clarifaiFace.bottom_row * height)
    }
  }

  const onRouteChange = (route) => {
    if(route === 'signout') {
      setIsSignedIn(false)
      setInput('')
      setImageUrl('')
      setBox('')
      setRoute('signin')
      setUser({
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      })
    } else if(route === 'home') {
      setIsSignedIn(true)
    }
    setRoute(route)
  }

  const displayFaceBox = (box) => {
    setBox(box)
  }

  const onInputChange = (event) => {
    setInput(event.target.value)
  }

  const onButtonSubmit = () => {
    setImageUrl(input)
    app.models.predict(Clarifai.FACE_DETECT_MODEL, input)
      .then(res => {
        if(res) {
          fetch('http://localhost:5000/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: user.id
            })
          }).then(response => response.json())
            .then(count => {
              setUser({...user, entries: count})
            }).catch(console.log)
        }
        displayFaceBox(calculateFaceLocation(res))
      })
      .catch(err => console.log(err))
  }


  return (
    <div className="App">
    <Particles className='particles'
              params={{
                  particles: {
                    number: {
                      value:100,
                      density: {
                        enable: true,
                        value_area: 900,
                      }
                    }
                    
                  }
            		}
            	}
              
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      { route === 'home'
        ?  <div>
              <Logo />
              <Rank name={user.name} entries={user.entries} />
              <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
              <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        : (
          route === 'signin' 
          ?  <Signin loadUser={loadUser} onRouteChange={onRouteChange} />
          :  <Register loadUser={loadUser} onRouteChange={onRouteChange} />

        )
      }
    </div>
  )
}

export default App;
