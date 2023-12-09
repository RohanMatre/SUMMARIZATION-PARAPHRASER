import sys

if 'factorsum' not in sys.path:
    sys.path.append('factorsum')
    last_training_domain = None
    last_dataset = None
    last_split = None


from factorsum.model import FactorSum, summarize

model = FactorSum('arxiv')
document = """
Deep neural networks trained with some version of Stochastic Gradient Descent have been shown
to substantially outperform previous approaches on various supervised learning tasks in computer
vision [Krizhevsky et al., 2012] and speech processing [Hinton et al., 2012]. But state-of-the-art
deep neural networks often require many days of training. It is possible to speed-up the learning
by computing gradients for different subsets of the training cases on different machines or splitting
the neural network itself over many machines [Dean et al., 2012], but this can require a lot of com-
munication and complex software. It also tends to lead to rapidly diminishing returns as the degree
of parallelization increases. An orthogonal approach is to modify the computations performed in
the forward pass of the neural net to make learning easier. Recently, batch normalization [Ioffe and
Szegedy, 2015] has been proposed to reduce training time by including additional normalization
stages in deep neural networks. The normalization standardizes each summed input using its mean
and its standard deviation across the training data. Feedforward neural networks trained using batch
normalization converge faster even with simple SGD. In addition to training time improvement, the
stochasticity from the batch statistics serves as a regularizer during training.
Despite its simplicity, batch normalization requires running averages of the summed input statis-
tics. In feed-forward networks with fixed depth, it is straightforward to store the statistics separately
for each hidden layer. However, the summed inputs to the recurrent neurons in a recurrent neu-
ral network (RNN) often vary with the length of the sequence so applying batch normalization to
RNNs appears to require different statistics for different time-steps. Furthermore, batch normaliza-
tion cannot be applied to online learning tasks or to extremely large distributed models where the
minibatches have to be small.
This paper introduces layer normalization, a simple normalization method to improve the training
speed for various neural network models. Unlike batch normalization, the proposed method directly
estimates the normalization statistics from the summed inputs to the neurons within a hidden layer
so the normalization does not introduce any new dependencies between training cases. We show that
layer normalization works well for RNNs and improves both the training time and the generalization
performance of several existing RNN models."""

summary = model.summarize(
                document, # a document string 
                target_budget=200,  
                verbose=True,
            )

summary_statement = ''.join(summary[0])

print(summary_statement)
