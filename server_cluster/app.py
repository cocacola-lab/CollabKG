'''
    API for rank order clustering documents.
'''

import itertools
import pathlib
from collections import Counter, defaultdict
from enum import Enum
from typing import List, Optional

import numpy as np
import uvicorn
from fastapi import Body, FastAPI, HTTPException
from loguru import logger
from nltk import FreqDist
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.decomposition import LatentDirichletAllocation
from access import chatie

log_path = pathlib.Path(__file__).parent.resolve()


logger.add(
    f"{log_path}/api.log", rotation="10 MB")

app = FastAPI()

# Load SBERT model
# logger.info(f'Loading model')
# model_checkpoint = 'all-distilroberta-v1'
# model = SentenceTransformer(model_checkpoint)
# logger.info(f'{model_checkpoint} loaded')


@app.get("/ping")
def ping_pong():
    ''' Checks API service '''
    return {"message": "pong"}


class Data(BaseModel):
    corpus: List[str]


@app.post("/rank_cluster")
def rank_cluster(data: Data):
    '''

    '''

    # logger.info(
    #     "Performing rank order clustering with SentBERT and Agglomerative clustering")
    # logger.info(f'Corpus size: {len(data.corpus)}')

    # # Embed sentences
    # logger.info(f'Corpus embedding started')
    # corpus_embeddings = model.encode(
    #     data.corpus, batch_size=64)  # show_progress_bar=False, convert_to_tensor=True
    # logger.info(f'Corpus embedding finished')

    # logger.info(f'Clustering started')
    # logger.info('Transforming embedding for agglomerative clustering')
    # # Normalize the embeddings to unit length
    # corpus_embeddings = corpus_embeddings / \
    #     np.linalg.norm(corpus_embeddings, axis=1, keepdims=True)

    # # , affinity='cosine', linkage='average', distance_threshold=0.4)
    # clustering_model = AgglomerativeClustering(
    #     n_clusters=None, distance_threshold=1.5)

    # clustering_model.fit(corpus_embeddings)
    # logger.info('fitted cluster model')

    # cluster_assignment = clustering_model.labels_
    # # logger.debug(cluster_assignment)
    # logger.info(f'Clustering finished')

    # clustered_corpus = []
    # for sentence_id, cluster_id in enumerate(cluster_assignment):
    #     # print(sentence_id, cluster_id)
    #     clustered_corpus.append({"id": int(sentence_id), "cluster": int(
    #         cluster_id), "sentence": data.corpus[sentence_id]})

    # # Get human-interpretable label for cluster
    # groups = defaultdict(list)

    # # Group clusters into arrays
    # for obj in clustered_corpus:
    #     groups[obj["cluster"]].append(obj)

    # # Find topn terms in clusters
    # cluster_terms = {}
    # for cluster in groups.values():
    #     cluster_number = cluster[0]['cluster']

    #     cluster_tokens = list(itertools.chain(
    #         *[text['sentence'].split() for text in cluster]))

    #     token_freq_dist = FreqDist(cluster_tokens)
    #     top_n_terms = token_freq_dist.most_common(5)
    #     top_n_term_string = "|".join([term for term, _ in top_n_terms])
    #     cluster_terms[cluster_number] = top_n_term_string

    # # Get cluster counts / distribution
    # cluster_distribution = Counter(
    #     sentence['cluster'] for sentence in clustered_corpus)
    # # print(cluster_distribution)

    # cluster_details = [{"cluster_number": cluster_no, 'count': cluster_distribution[cluster_no],
    #                     'top_n_terms': cluster_terms[cluster_no]} for cluster_no in cluster_distribution.keys()]

    # cluster_details_sorted = sorted(
    #     cluster_details, key=lambda d: d['cluster_number'])

    #return {'clustered_corpus': clustered_corpus, 'cluster_details': cluster_details_sorted}
    return {'clustered_corpus': {}, 'cluster_details': {}}

class Data2(BaseModel):
    payin: dict

@app.post("/auto_annotate")
def auto_annotate(data: Data2):
    logger.info("hello, i am auto annotater")
    payin = data.payin
    logger.info(payin)

    pretype = payin['pretype']
    text = payin['text']
    task = payin['task']
    lang = payin['lang']
    
    # 获得chatie需要的type和sentence
    # sentence
    temp_text = list(map(lambda x: x['value'], text['tokens'].values()))
    if lang == 'chinese':
        sentence = ''.join(temp_text)
    else:
        sentence = ' '.join(temp_text)
        
    payin['sentence'] = sentence

    # type
    if task == 'entity':
        type1 = list(map(lambda x: x['name'], pretype))

        payin['type'] = type1
    elif task == 'relation':
        type1 = {}
        for item in pretype:
            key = item['name']
            value = item['extra']
            type1[key] = value
        payin['type'] = type1
    else:
        type1 = {}
        for item in pretype:
            value = item['name']
            extra = item['extra']
            for key in extra:
                if key in type1:
                    type1[key].append(value)
                else:
                    type1[key] = [value]
        payin['type'] = type1
    
    payin['access'] = ""

    output = chatie(payin, logger)
    
    # 将result转换为前端想要的形式
    # ------------tools function ------------------
    def getEntitymarkup(ent, lab, temp_text, label2id, lang):
        single_markup = {'isEntity': True,}

        # label
        if lab in label2id:
            single_markup['entityLabel'] = lab
            single_markup['entityLabelId'] = label2id[lab]
        else: return {}

        # start end
        mark = False
        if lang == 'english':
            entlist = ent.split(' ')
        elif lang == 'chinese':
            entlist = list(ent)
        startw = entlist[0]
        wlen = len(entlist)
        for idx, word in enumerate(temp_text):
            if startw == word:
                prew = temp_text[idx:idx+wlen]
                if prew == entlist:
                    single_markup['entitySpanStart'] = idx
                    single_markup['entitySpanEnd'] = idx + wlen -1
                    single_markup['entityText'] = ' '.join(entlist)
                    mark =True
                    break
        if not mark:
            return {}
        else:
            return single_markup
        
    def getRelationmarkup(r, rlabel2id):
        single_markup = {}
        if r in rlabel2id:
            single_markup['relationLabelId'] = rlabel2id[r]
            return single_markup
        else: return {}  


    result = output['result']
    logger.info(result)

    if type(result[0]) == str:
        return {'markup': []}
    
    if task == 'entity':
        markup = []
        # 获得start end和label
        # 构建label2id dict
        label2id = {item['name']: item['_id'] for item in pretype}
        for ent, lab in result:
            single_markup = getEntitymarkup(ent, lab, temp_text, label2id, lang)
            if single_markup != {}:
                markup.append(single_markup)
            
        return {'markup': markup}
        """ return {'markup':[
            {
                'entitySpanStart': 1,
                'entitySpanEnd': 1,
                'entityLabel': 'Location',
                'entityLabelId': payin['pretype'][2]['_id'],
                'entityText': 'love',
                'isEntity': True,
            }
        ]} """
    elif task == 'relation':
        markup = []
        # 获得start end和label
        # 构建entity label2id dict
        label2id = {item['name']: item['_id'] for item in payin['epretype']}
        rlabel2id = {item['name']: item['_id'] for item in payin['pretype']}
        for s, st, r, o, ot in result:
            single = []

            single_markup = getEntitymarkup(s, st, temp_text, label2id, lang)
            if single_markup != {}:
                single.append(single_markup)
            else:
                continue

            single_markup = getEntitymarkup(o, ot, temp_text, label2id, lang)
            if single_markup != {}:
                single.append(single_markup)
            else:
                continue

            single_markup = getRelationmarkup(r, rlabel2id)
            if single_markup != {}:
                single.append(single_markup)
            else:
                continue

            markup.append(single)

        return {'markup': markup}

        """ return {'markup':[
            [
                {
                'entitySpanStart': 1,
                'entitySpanEnd': 1,
                'entityLabel': 'Location',
                'entityLabelId': payin['epretype'][2]['_id'],
                'entityText': 'love',
                'isEntity': True,
                },
                {
                'entitySpanStart': 2,
                'entitySpanEnd': 2,
                'entityLabel': 'Location',
                'entityLabelId': payin['epretype'][2]['_id'],
                'entityText': 'you',
                'isEntity': True,
                },
                {
                'relationLabelId': payin['pretype'][0]['_id']
                }
            ],
        ]} """
    else:
        # event
        markup = []
        # 获得start end和label
        # 构建entity label2id dict
        label2id = {item['name']: item['_id'] for item in payin['epretype']}
        rlabel2id = {item['name']: item['_id'] for item in payin['pretype']}
        for item in result:
            for eetype in item:
                arguement_role = item[eetype][0]

                trigger = item[eetype][1]
                trigger_markup = getEntitymarkup(trigger, eetype, temp_text, label2id, lang)
                if trigger_markup == {}:
                    continue
                for r in arguement_role:
                    single = [trigger_markup]

                    argument = arguement_role[r]
                    if argument.lower() in ['无', 'none']:
                        continue
                    argument_markup = getEntitymarkup(argument, payin['epretype'][0]['name'], temp_text, label2id, lang)
                    if argument_markup != {}:
                        single.append(argument_markup)
                    else:
                        continue

                    r_markup = getRelationmarkup(r, rlabel2id)
                    if r_markup != {}:
                        single.append(r_markup)
                    else:
                        continue

                    markup.append(single)

        return {'markup': markup}



if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000)
