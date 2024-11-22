import { promises as fs } from 'fs'
import path from 'path'

import { filePattern } from './regexp.repo.js'
import { folderPath, compiler, parser } from './prompt'

interface State {
    files: string[]
}

const state: State = {
    files: []
}

const saveInTxt = (text: string) => {
    try {
        fs.writeFile('result.txt', text, 'utf8')
    } catch (error) {
        console.error("Error to save result data:")
        console.error(error)
    }
}

const saveToCsv = async (data: string[][], filePath: string): Promise<void> => {
    const rows = data.map(row => row.join(','));
    const csvContent = rows.join('\n');
    const fullPath = path.resolve(filePath);
    await fs.writeFile(fullPath, csvContent, 'utf8');
}

const getFilePaths = async (folderPath: string) => {
    try {
        const files = await fs.readdir(folderPath)

        for (const file of files) {
          const filePath = path.join(folderPath, file)
          const stats = await fs.stat(filePath)

          if (stats.isFile() && filePattern.test(filePath)) {
            state.files.push(filePath)
          }
          
          else if (stats.isDirectory()) {
            await getFilePaths(filePath)
          }
        }
    } catch (error) {
        console.error('Error to read files:', error)
    }
}

;(async () => {
    await getFilePaths(folderPath)
    
    const contents = await Promise.all(
        state.files.map(async (filePath: string): Promise<string[][]> => {
            const fileContent: string = await fs.readFile(filePath, 'utf8')
            const parsedResult =  parser(compiler({ fileContent, filePath }))

            return parsedResult
        })
    )

    // saveToCsv(contents.flat(1), 'result.csv')
    // saveInTxt(contents.flat().join('\n'))
})()
