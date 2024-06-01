# CollabKG: A Learnable Human-Machine-Cooperative Information Extraction Toolkit for (Event) Knowledge Graph Construction
- CollabKG is an open-source IE annotation toolkit that **unifies NER, RE, and EE tasks**, integrates **KG and EKG**, and supports both English and Chinese languages. 
- CollabKG **combines automatic and manual labeling** to build a learnable human-machine cooperative system. In particular, humans benefit from machines and meanwhile, manual labeling provides a reference for machines to update during annotation. 
- Additionally, CollabKG is designed with many other **appealing features** (customization, training-free, propagation, etc) that enhance productivity, power, and user-friendliness. We holistically compare our toolkit with other existing tools on these features.
- CollabKG **Extensive human studies** suggest that CollabKG can significantly improve the effectiveness and efficiency of manual annotation, as well as reduce variance.

  🖥 [Try out CollabKG online](http://124.221.16.143:3020/)

  🖹 [CollabKG paper](https://arxiv.org/pdf/2307.00769.pdf)

  🎥 [CollabKG systems demonstration video](https://www.youtube.com/channel/UCsadiRvhW9dsmn4KtRDCaFg)

  📌 [Overview of how to use CollabKG](https://github.com/cocacola-lab/CollabKG/blob/main/About.md)

  📌 [Frequently Asked Questions (FAQ)](https://github.com/cocacola-lab/CollabKG/blob/main/FAQ.md)

  📨 Feel free to reach out if you have any questions by emailing 22120436@bjtu.edu.cn

## Getting started

CollabKG can be built using Docker. Before doing so please add a secure token to the `TOKEN_SECRET` field in `/server/.env` for user password hashing and salting. After this, in the repository root directory, execute:

```
$ make run
```

or alternatively:

```
$ docker-compose -f docker-compose.yml up
```

## Issues, Bugs and Feedback
If you come across any issues, bugs or have any general feedback please feel free to reach out (email: 22120436@bjtu.edu.cn). Alternatively, feel free to raise an issue, or better yet, make a pull request 🙂.

### Known Issues/Bugs

## Future features

## Acknowledges
Thanks to the [QuickGraph](https://github.com/nlp-tlp/quickgraph/tree/main) team for their support

## Attribution

Please cite our [[paper]]() if you find it useful in your research:

```

```
