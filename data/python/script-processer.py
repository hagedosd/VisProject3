import os
import pandas as pd
import re
from pathlib import Path

txtFileDir = 'data/transcripts'

# This regex attempts to capture character names and dialouge in a more consistent way
nameFilter = re.compile(r"^([\w\s]+: ?.+)|^\(.+\)[^\S\r\n]([\w\s]+: .+)|^(?:\(.+\)|\[.+\])([\w]+: .+)|([\w]+).+(: .+)")

##################
# Added to prevent script from running unnecessarily
# This script only needs to run once to generate himym-dialogues.csv
print(f'script-processor.py is dsiabled with exit().')
exit()
##################

# Initialize list of line dicts
lineDictList = []

# For each transcript file
for filename in os.listdir(txtFileDir):
    file = os.path.join(txtFileDir, filename)
    with open(file) as textFile:
        lines = textFile.readlines()
        season = 0
        episode = 0
        scene = 0
        for line in lines:
            result = re.search(nameFilter, line)
            if '**Season' in line:
                season = int(line.split('-')[1])
            elif '**Episode' in line:
                episode = int(line.split('-')[1])
            elif line.startswith('Scene'):
                scene += 1
            
            # This executes when the regex matches something in the current line
            elif result:
                things = result.groups()
                importantThings = list(filter(None, things))
                if scene == 0:
                    scene = 1
                # If the regex made 2 or more captures join them into one element
                if (len(importantThings)>1):
                    joinedThings = "".join(importantThings)
                # When there is one capture move it into joinedThings so a split is done on only one variable
                else:
                    joinedThings = importantThings[0]

                # Split the name and dialouge using ":"
                lineSplit = joinedThings.split(':')
                character = lineSplit[0]
                dialogue = lineSplit[1]
                lineDict = {'season': season, 'episode': episode, 'scene': scene, 'character': character, 'dialogue': dialogue}
                lineDictList.append(lineDict)


# Write list to dataframe and save
df = pd.DataFrame(lineDictList)
df.to_csv('data/himym-dialogues.csv', index=False)
