import React from 'react'
import './FaceRecognition.css'

const FaceRecognition = ({ imageUrl, box }) => {
    return (
        <div className='center'>
            <div className="absolute mt2">
                <img id='inputimage' src={imageUrl} alt="image" width='500px' height='auto'/>
                <div className='bounding-box' style={{bottom:box.bottomRow,top:box.topRow,left:box.leftCol,right:box.rightCol}}>

                </div>
            </div>
        </div>
    )
}

export default FaceRecognition
