import requests as req
from bs4 import BeautifulSoup

##################
print(f'script-processor.py is dsiabled with exit().')
exit()
##################

episodes = {}
# Seasons 1-6 from pages 1-6
for i in range(1,7):
    page = open("data/webpages/page-" + str(i) + ".html", 'r')
    soup = BeautifulSoup(page.read(), features="html5lib")

    for row in soup.select("td.topic-titles a"):
        parts = row.text.split(" - ")
        if len(parts) > 1:
            episodes[parts[0]] = {"title": parts[1], "link": row.get("href")}

for key, value in episodes.items():
    parts = key.split("x")
    season = int(parts[0])
    episode = int(parts[1])
    # Only for first 6 seasons
    if season < 7:
        filename = "data/transcripts/S%d-Ep%d.txt" %(season, episode)
        print(filename)

        with open(filename, 'w') as handle:
            # Write scene and episode at top of file
            handle.write('**Season-' + str(season) + '\n')
            handle.write('**Episode-' + str(episode) + '\n')

            # Get the html page for the episode
            uri = "http://transcripts.foreverdreaming.org" + value["link"]
            response = req.get(uri)
            transcript_page = BeautifulSoup(response.content, 'html.parser')
            # Get all lines with 'p' tag, those are the ones with the dialogue
            p_lines = transcript_page.find_all("p")
            # Build list of scene changes that are not specified as "Scene"
            other_scene_lines = transcript_page.find_all("em")
            
            other_scene_lines_list = []
            for scene_line in other_scene_lines:
                other_scene_lines_list.append(scene_line.get_text())

            for line in p_lines:
                # Try to get line and write it to file
                try:
                    if line.get_text() in other_scene_lines_list and not line.get_text().startswith('('):
                        handle.write("Scene " + line.get_text() + "\n")
                    elif (':' not in line.get_text()) and ('are in' in line.get_text() or 'are at' in line.get_text() or 'enter' in line.get_text()):
                        handle.write("Scene " + line.get_text() + "\n")
                    else:
                        handle.write(line.get_text() + "\n")
                # Some lines have weird symbols, skip those
                except:
                    pass
