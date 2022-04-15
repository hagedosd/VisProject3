import os
import pandas as pd

txtFileDir = 'data/transcripts'

##################
print(f'script-processor.py is dsiabled with exit().')
exit()
##################

# Initialize list of line dicts
lineDictList = []

# For each transcript file
for filename in os.listdir(txtFileDir):
    file = os.path.join(txtFileDir, filename)
    with open(file) as txtFile:
        lines = txtFile.read().split('\n')
        season = 0
        episode = 0
        scene = 0
        for line in lines:
            if '**Season' in line:
                season = int(line.split('-')[1])
            if '**Episode' in line:
                episode = int(line.split('-')[1])
            if line.startswith('Scene'):
                scene += 1
            if ':' in line and '[' not in line:
                # Correct for the episodes that don't specify first scene is starting
                if scene == 0:
                    scene = 1
                lineSplit = line.split(':')
                character = lineSplit[0]
                dialogue = lineSplit[1]
                lineDict = {'season': season, 'episode': episode, 'scene': scene, 'character': character, 'dialogue': dialogue}
                lineDictList.append(lineDict)

# Write list to dataframe and save
df = pd.DataFrame(lineDictList)
df.to_csv('data/himym-dialogues.csv', index=False)
