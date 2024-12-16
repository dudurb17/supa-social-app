export const  getUserImageSrc =  imagePath =>{
  if(imagePath.uri){
      return {uri: imagePath.uri}
  }
  else{
    return require('../assets/images/defaultUser.png')
  }
}