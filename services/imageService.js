import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { NEXT_PUBLIC_SUPABASE_URL } from '../constants/envProject';


export const  getUserImageSrc =  imagePath =>{
  if(imagePath){
      return getSupabaseFileUrl(imagePath)
  }
  return require('../assets/images/defaultUser.png')

}

export const getSupabaseFileUrl = filePath =>{
  if(filePath){
    return {uri: `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${filePath}`}
  }
  return null
}

export const uploadFile= async(folderName, fileUri, isImage=true)=>{
  try {
    let filaName = getFilePath(folderName, isImage);

    const fileBase64 = await FileSystem.readAsStringAsync(fileUri,{
      encoding: FileSystem.EncodingType.Base64
    })

    let imageData = decode(fileBase64)

    let {data, error} =await supabase
    .storage
    .from('uploads')
    .upload(filaName, imageData,{
      cacheControl:'3600',
      upsert:false, 
      contentType: isImage? 'image/*':'video/*' 
    });

    if( error){
      console.log('File upload error: ', error)
      return {success:false , msg:'Could not upload media'}

    }
     console.log('data:', data)
    return {success:true, data: data.path}
    
  } catch (error) {
    console.log('File upload error: ', error)
    return {success:false , msg:'Could not upload media'}
  }
}

export const getFilePath = (folderName, isImage) =>{
  return `/${folderName}/${(new Date()).getDate()}${isImage? 'png': 'mp4'}`;
}