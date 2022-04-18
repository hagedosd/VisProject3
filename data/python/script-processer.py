import os
import pandas as pd
import re
from pathlib import Path

txtFileDir = 'data/transcripts'
# nameFilter = re.compile(r"^([\w\s]+: ?.+)|^\(.+\)[^\S\r\n]([\w\s]+: .+)|^(?:\(.+\)|\[.+\])([\w]+: .+)|([\w]+).+(: .+)|\*{2}Season-(\d)|\*{2}Episode-(\d)|(Scene)")
nameFilter = re.compile(r"^([\w\s]+: ?.+)|^\(.+\)[^\S\r\n]([\w\s]+: .+)|^(?:\(.+\)|\[.+\])([\w]+: .+)|([\w]+).+(: .+)")

# ##################
# print(f'script-processor.py is dsiabled with exit().')
# exit()
# ##################

# Initialize list of line dicts
lineDictList = []

# For each transcript file
# for filename in os.listdir(txtFileDir):
#     file = os.path.join(txtFileDir, filename)
#     with open(file) as txtFile:
#         lines = txtFile.read().split('\n')
#         season = 0
#         episode = 0
#         scene = 0
#         for line in lines:
#             if '**Season' in line:
#                 season = int(line.split('-')[1])
#             if '**Episode' in line:
#                 episode = int(line.split('-')[1])
#             if line.startswith('Scene'):
#                 scene += 1
#             if ':' in line and '[' not in line:
#                 # Correct for the episodes that don't specify first scene is starting
#                 if scene == 0:
#                     scene = 1
#                 lineSplit = line.split(':')
#                 character = lineSplit[0]
#                 dialogue = lineSplit[1]
#                 lineDict = {'season': season, 'episode': episode, 'scene': scene, 'character': character, 'dialogue': dialogue}
#                 lineDictList.append(lineDict)

# file = os.path.join(txtFileDir, "S1-Ep1.txt")
for filename in os.listdir(txtFileDir):
    file = os.path.join(txtFileDir, filename)
    with open(file) as textFile:
        lines = textFile.readlines()
        season = 0
        episode = 0
        scene = 0
        linecount = 0
        nameAndDialouge = [None]
        for line in lines:
            result = re.search(nameFilter, line)
            if '**Season' in line:
                season = int(line.split('-')[1])
            elif '**Episode' in line:
                episode = int(line.split('-')[1])
            elif line.startswith('Scene'):
                scene += 1
            elif result:
                linecount += 1
                things = result.groups()
                importantThings = list(filter(None, things))
                if scene == 0:
                    scene = 1
                if (len(importantThings)>1):
                    joinedThings = "".join(importantThings)
                    # print("Joined important things:", joinedThings)
                else:
                    joinedThings = importantThings[0]
                    # print("Nonjoined things:", joinedThings)
                lineSplit = joinedThings.split(':')
                # print("This is the captured data:", nameAndDialouge)
                character = lineSplit[0]
                dialogue = lineSplit[1]
                lineDict = {'season': season, 'episode': episode, 'scene': scene, 'character': character, 'dialogue': dialogue}
                lineDictList.append(lineDict)
                # print(character, "says:", dialogue)
                # print(character)


# Write list to dataframe and save
df = pd.DataFrame(lineDictList)
df.to_csv('data/himym-dialogues.csv', index=False)
